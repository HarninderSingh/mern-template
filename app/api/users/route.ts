import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  console.log("API /api/users GET request received.")
  console.log("Session:", session)

  if (!session || session.user?.role !== "admin") {
    console.log("Unauthorized access attempt to /api/users. Role:", session?.user?.role)
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }

  try {
    console.log("Attempting to connect to DB...")
    await dbConnect()
    console.log("DB Connected.")

    console.log("Fetching users from MongoDB...")
    const users = await User.find({}, "-password").sort({ createdAt: -1 }) // Exclude password, sort by creation date
    console.log(`Found ${users.length} users.`)
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error("Error fetching users in /api/users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
