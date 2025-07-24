import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { z } from "zod"

const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }

  await dbConnect()

  try {
    const { id } = params
    const body = await req.json()
    const { role } = updateUserRoleSchema.parse(body)

    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    user.role = role
    await user.save()

    return NextResponse.json({ message: "User role updated successfully", user: user.email }, { status: 200 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 })
    }
    console.error("Error updating user role:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
