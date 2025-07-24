import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminUserTable } from "@/components/admin-user-table"
import dbConnect from "@/lib/mongodb" // Import dbConnect
import User from "@/models/User" // Import User model

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== "admin") {
    return (
      <Card className="w-full max-w-md bg-[#2D3748] text-white border-[#4A5568]">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Admin Panel</CardTitle>
          <CardDescription className="text-gray-300">
            This page is only accessible to users with the &quot;admin&quot; role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-red-400">Access Denied.</p>
            <p className="text-gray-300">You do not have the necessary permissions to view this page.</p>
            <Link href="/dashboard">
              <Button className="bg-white text-gray-900 hover:bg-gray-100">Go to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  let users: any[] = []
  try {
    await dbConnect() // Connect to the database
    // Fetch users directly from MongoDB
    users = await User.find({}, "-password").sort({ createdAt: -1 }).lean() // .lean() for plain JS objects
    console.log(`Fetched ${users.length} users directly in AdminPage.`)
    console.log("First 5 fetched users:", JSON.stringify(users.slice(0, 5), null, 2))
  } catch (error) {
    console.error("Error fetching users directly in AdminPage:", error)
    // Handle error, perhaps show a message to the admin
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="bg-[#2D3748] text-white border-b border-[#4A5568] rounded-t-md">
        <CardTitle className="text-2xl text-white">Admin Dashboard</CardTitle>
        <CardDescription className="text-gray-300">Manage all registered users.</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <AdminUserTable initialUsers={users} />
      </CardContent>
    </Card>
  )
}
