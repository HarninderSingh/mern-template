import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import mongoose from "mongoose" // Import mongoose to access connection details

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  console.log("API /api/users GET request received.")
  console.log("Current session for API call:", JSON.stringify(session, null, 2)) // Log full session for debugging

  if (!session || session.user?.role !== "admin") {
    console.log("Unauthorized access attempt to /api/users. User role in session:", session?.user?.role)
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }

  try {
    console.log("User is authorized as admin. Attempting to connect to DB...")
    await dbConnect()
    console.log("DB Connected. Database name:", mongoose.connection.name) // Log the connected DB name

    console.log("Fetching users from MongoDB using User.find({}) query...")
    const users = await User.find({}, "-password").sort({ createdAt: -1 }) // Exclude password, sort by creation date
    console.log(`MongoDB query completed. Found ${users.length} users.`)
    console.log("Fetched users (first 5):", JSON.stringify(users.slice(0, 5), null, 2)) // Log first few users

    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error("Error fetching users in /api/users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
