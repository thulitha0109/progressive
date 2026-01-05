import { getUsers } from "@/server/actions/users"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Edit, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteUserButton } from "./delete-user-button"

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string, search?: string }>
}) {
    const { page: pageParam, search: searchParam } = await searchParams
    const page = Number(pageParam) || 1
    const search = searchParam || ""
    const { users, totalPages } = await getUsers(page, 20, search)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage users and their roles.
                    </p>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                            <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/users/${user.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <DeleteUserButton userId={user.id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination could go here */}
        </div>
    )
}
