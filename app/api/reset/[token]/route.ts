import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import PasswordResetToken from "@/models/PasswordResetToken"
import { z } from "zod"

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

export async function POST(req: Request, { params }: { params: { token: string } }) {
  await dbConnect()

  try {
    const { token } = params
    const body = await req.json()
    const { password } = resetPasswordSchema.parse(body)

    const resetToken = await PasswordResetToken.findOne({ token })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ message: "Invalid or expired reset token." }, { status: 400 })
    }

    const user = await User.findOne({ email: resetToken.email })
    if (!user) {
      return NextResponse.json({ message: "User not found for this token." }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    await user.save()

    await PasswordResetToken.deleteOne({ token })

    return NextResponse.json({ message: "Password has been reset successfully." }, { status: 200 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    console.error("Reset password API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
