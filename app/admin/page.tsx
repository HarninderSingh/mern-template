import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminUserTable } from "@/components/admin-user-table"
import { headers } from "next/headers"

interface User {
  _id: string
  name?: string
  email: string
  role: "user" | "admin"
  createdAt: string
}

async function fetchUsers(): Promise<users[]> {
  const headersList = headers()
  const protocol = headersList.get("x-forwarded-proto") || "http"
  const host = headersList.get("host")
  const baseUrl = `${protocol}://${host}`

  console.log("Fetching users from:", `${baseUrl}/api/users`)

  const res = await fetch(`${baseUrl}/api/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // Ensure data is always fresh
  })

  if (!res.ok) {
    console.error("Failed to fetch users from API:", res.status, res.statusText)
    // Attempt to read error message from response body
    try {
      const errorData = await res.json()
      console.error("API Error Details:", errorData)
    } catch (e) {
      console.error("Could not parse error response body.")
    }
    return []
  }

  const users = await res.json()
  console.log("Users received in AdminPage:", users)
  return users
}

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

  const users = await fetchUsers()

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
