import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect()
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await User.findOne({ email: credentials.email })

        if (!user || !user.password) {
          return null // User not found or no password (e.g., OAuth user)
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh every 24h
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      console.log("JWT Callback - Token role:", token.role) // Add this log
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      console.log("Session Callback - Session user role:", session.user.role) // Add this log
      return session
    },
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      await dbConnect()
      if (account?.provider === "google") {
        try {
          let existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // Create new user if not exists
            existingUser = await User.create({
              email: user.email,
              name: user.name,
              // No password for OAuth users
              role: "user", // Default role for new OAuth users
            })
          }
          // Attach MongoDB user ID to NextAuth user object
          user.id = existingUser._id.toString()
          user.role = existingUser.role
          return true
        } catch (error) {
          console.error("Error during Google sign-in:", error)
          return false
        }
      }
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
