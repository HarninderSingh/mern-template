import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import PasswordResetToken from "@/models/PasswordResetToken"
import crypto from "crypto"
import { Resend } from "resend"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  await dbConnect()

  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await User.findOne({ email })
    if (!user) {
      // For security, don't reveal if email exists or not
      return NextResponse.json(
        { message: "If an account with that email exists, a password reset link has been sent." },
        { status: 200 },
      )
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    await PasswordResetToken.findOneAndUpdate({ email }, { token, expiresAt }, { upsert: true, new: true })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin")}/reset/${token}`

    if (resend && process.env.EMAIL_FROM) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Password Reset Request",
          html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
        })
        console.log(`Password reset email sent to ${email}`)
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError)
        // Continue without throwing error, as the token is still generated
      }
    } else {
      console.log(`Password reset link for ${email}: ${resetUrl}`)
    }

    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 },
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    console.error("Forgot password API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
