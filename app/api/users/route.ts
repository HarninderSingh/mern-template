import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import mongoose from "mongoose"

export async function GET(req: Request) {
  // Log the session directly within the API route
  const session = await getServerSession(authOptions)
  console.log("--- API /api/users GET Request Debug ---")
  console.log("Session received in /api/users:", JSON.stringify(session, null, 2))

  if (!session || session.user?.role !== "admin") {
    console.log("Authorization failed in /api/users. Session user role:", session?.user?.role)
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
  }

  try {
    console.log("User is authorized as admin. Attempting to connect to DB...")
    await dbConnect()
    console.log("DB Connected. Database name:", mongoose.connection.name)

    console.log("Fetching users from MongoDB using User.find({}) query...")
    const users = await User.find({}, "-password").sort({ createdAt: -1 })
    console.log(`MongoDB query completed. Found ${users.length} users.`)
    console.log("Fetched users (first 5):", JSON.stringify(users.slice(0, 5), null, 2))

    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error("Error fetching users in /api/users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
