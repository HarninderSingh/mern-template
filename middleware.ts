import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Example: Only admin users can access /admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // If there is a token, the user is authenticated
        // This will redirect unauthenticated users to the signIn page defined in authOptions
        return !!token
      },
    },
    pages: {
      signIn: "/login", // Redirect to custom login page
    },
  },
)

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*"],
}
