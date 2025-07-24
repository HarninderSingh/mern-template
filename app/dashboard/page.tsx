import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Dashboard</CardTitle>
        <CardDescription>Welcome to your protected dashboard!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session ? (
          <div className="space-y-2">
            <p>
              Hello, <span className="font-semibold">{session.user?.name || session.user?.email}</span>!
            </p>
            <p>
              Your role: <span className="font-semibold">{session.user?.role}</span>
            </p>
            <p className="text-sm text-muted-foreground">This content is only visible to authenticated users.</p>
            {session.user?.role === "admin" && (
              <Link href="/admin">
                <Button>Go to Admin Panel</Button>
              </Link>
            )}
          </div>
        ) : (
          <p>You are not logged in. Please log in to view this content.</p>
        )}
      </CardContent>
    </Card>
  )
}
