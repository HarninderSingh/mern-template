"use client"
import { useState, useTransition } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface User {
  _id: string
  name?: string
  email: string
  role: "user" | "admin"
  createdAt: string
}

interface AdminUserTableProps {
  initialUsers: User[]
}

export function AdminUserTable({ initialUsers }: AdminUserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        })

        const data = await response.json()

        if (response.ok) {
          setUsers((prevUsers) => prevUsers.map((user) => (user._id === userId ? { ...user, role: newRole } : user)))
          toast({
            title: "Success",
            description: `Role for ${data.user} updated to ${newRole}.`,
          })
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to update user role.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error updating role:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while updating role.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="relative overflow-x-auto rounded-md border bg-[#2D3748] border-[#4A5568] text-white">
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="border-b-[#4A5568] hover:bg-[#2D3748]">
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Role</TableHead>
            <TableHead className="text-white">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user._id} className="border-b-[#4A5568] hover:bg-[#3A475A]">
                <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(newRole: "user" | "admin") => handleRoleChange(user._id, newRole)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[120px] bg-[#1A202C] text-white border-[#4A5568] focus:ring-[#63B3ED]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2D3748] text-white border-[#4A5568]">
                      <SelectItem value="user" className="hover:bg-[#3A475A] focus:bg-[#3A475A]">
                        User
                      </SelectItem>
                      <SelectItem value="admin" className="hover:bg-[#3A475A] focus:bg-[#3A475A]">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{format(new Date(user.createdAt), "PPP")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
