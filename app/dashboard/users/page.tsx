"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Search, Plus, Shield, UserCheck, UserX, Eye, Edit, Trash2, Upload } from "lucide-react"
import { UserForm, User } from "@/components/user-form"
import { DeleteUserDialog } from "@/components/delete-user-dialog"
import { UserDetailsDialog } from "@/components/user-details-dialog"
import { BulkActions } from "@/components/bulk-actions"
import { ImportUsersDialog } from "@/components/import-users-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

// Sample user data
const initialUsers: User[] = [
  {
    id: 1,
    name: "Shahriar Shawon",
    email: "john.doe@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-01-01 14:30",
    avatar: "",
    phone: "+1 (555) 123-4567",
    department: "IT",
    bio: "Senior system administrator with 8+ years of experience in managing enterprise infrastructure.",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Editor",
    status: "Active",
    lastLogin: "2025-01-01 12:15",
    avatar: "",
    phone: "+1 (555) 234-5678",
    department: "Marketing",
    bio: "Creative content strategist specializing in digital marketing campaigns.",
  },
  {
    id: 3,
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2024-12-28 09:45",
    avatar: "",
    phone: "+1 (555) 345-6789",
    department: "Sales",
    bio: "Sales representative focused on enterprise client relationships.",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice.brown@example.com",
    role: "Editor",
    status: "Active",
    lastLogin: "2025-01-01 16:20",
    avatar: "",
    phone: "+1 (555) 456-7890",
    department: "Design",
    bio: "UX/UI designer passionate about creating intuitive user experiences.",
  },
  {
    id: 5,
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "Never",
    avatar: "",
    phone: "+1 (555) 567-8901",
    department: "HR",
    bio: "Human resources specialist handling recruitment and employee relations.",
  },
]

const roles = ["Admin", "Editor", "Viewer"]
// Removed "Pending" status type
const statuses = ["Active", "Inactive"]

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Dialog states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  
  // Selected user states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  
  // Bulk selection
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  
  const { toast } = useToast()

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Bulk operations
  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id))
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map(user => user.id))
    } else {
      setSelectedUserIds([])
    }
  }

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId])
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId))
    }
  }

  const handleBulkDelete = (userIds: number[]) => {
    setUsers(prev => prev.filter(user => !userIds.includes(user.id)))
    setSelectedUserIds([])
    toast({
      title: "Users Deleted",
      description: `${userIds.length} user${userIds.length !== 1 ? 's' : ''} have been removed from the system.`,
      variant: "destructive",
    })
  }

  const handleBulkStatusUpdate = (userIds: number[], status: string) => {
    setUsers(prev => prev.map(user => 
      userIds.includes(user.id) ? { ...user, status } : user
    ))
    setSelectedUserIds([])
    toast({
      title: "Status Updated",
      description: `${userIds.length} user${userIds.length !== 1 ? 's' : ''} status updated to ${status}.`,
    })
  }

  const handleBulkRoleUpdate = (userIds: number[], role: string) => {
    setUsers(prev => prev.map(user => 
      userIds.includes(user.id) ? { ...user, role } : user
    ))
    setSelectedUserIds([])
    toast({
      title: "Role Updated",
      description: `${userIds.length} user${userIds.length !== 1 ? 's' : ''} role updated to ${role}.`,
    })
  }

  const handleExportUsers = (usersToExport: User[]) => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Department', 'Phone', 'Last Login'],
      ...usersToExport.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.department || '',
        user.phone || '',
        user.lastLogin
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Export Complete",
      description: `${usersToExport.length} user${usersToExport.length !== 1 ? 's' : ''} exported successfully.`,
    })
  }

  const handleImportUsers = (importedUsers: Partial<User>[]) => {
    const newUsers: User[] = importedUsers.map((userData, index) => ({
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + index + 1,
      lastLogin: "Never",
      avatar: "",
    } as User))

    setUsers(prev => [...prev, ...newUsers])
    toast({
      title: "Import Complete",
      description: `${newUsers.length} user${newUsers.length !== 1 ? 's' : ''} imported successfully.`,
    })
  }
  const handleCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      ...userData,
      id: Math.max(...users.map(u => u.id)) + 1,
      lastLogin: "Never",
      avatar: "",
    } as User

    setUsers(prev => [...prev, newUser])
    toast({
      title: "User Created",
      description: `${userData.name} has been successfully added to the system.`,
    })
  }

  const handleEditUser = (userData: Partial<User>) => {
    if (!selectedUser) return

    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id 
        ? { ...user, ...userData }
        : user
    ))
    
    toast({
      title: "User Updated", 
      description: `${userData.name}'s information has been successfully updated.`,
    })
  }

  const handleDeleteUser = () => {
    if (!userToDelete) return

    setUsers(prev => prev.filter(user => user.id !== userToDelete.id))
    toast({
      title: "User Deleted",
      description: `${userToDelete.name} has been removed from the system.`,
      variant: "destructive",
    })
    setUserToDelete(null)
  }

  // Dialog handlers
  const openCreateDialog = () => {
    setSelectedUser(null)
    setFormMode("create")
    setIsUserFormOpen(true)
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormMode("edit")
    setIsUserFormOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const openDetailsDialog = (user: User) => {
    setSelectedUser(user)
    setIsDetailsDialogOpen(true)
  }

  const updateUserRole = (userId: number, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ))
    toast({
      title: "Role Updated",
      description: `User role has been changed to ${newRole}.`,
    })
  }

  const updateUserStatus = (userId: number, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ))
    toast({
      title: "Status Updated", 
      description: `User status has been changed to ${newStatus}.`,
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active": return "default"
      case "Inactive": return "secondary"
      default: return "secondary"
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin": return "destructive"
      case "Editor": return "default"
      case "Viewer": return "secondary"
      default: return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users and their access permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Users
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered users in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active accounts
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === "Inactive").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently inactive accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users in your system with their roles and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedUserIds.length > 0 && (
            <BulkActions
              selectedUsers={selectedUsers}
              onBulkDelete={handleBulkDelete}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onBulkRoleUpdate={handleBulkRoleUpdate}
              onExportUsers={handleExportUsers}
              onDeselectAll={() => setSelectedUserIds([])}
            />
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all users"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                        aria-label={`Select ${user.name}`}
                      />
                    </TableCell>
                    <TableCell className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => openDetailsDialog(user)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(user.email)}
                          >
                            Copy email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          {roles.map(role => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => updateUserRole(user.id, role)}
                              disabled={user.role === role}
                            >
                              Set as {role}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {statuses.map(status => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => updateUserStatus(user.id, status)}
                              disabled={user.status === status}
                            >
                              Mark as {status}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Components */}
      <UserForm
        open={isUserFormOpen}
        onOpenChange={setIsUserFormOpen}
        user={selectedUser}
        onSubmit={formMode === "create" ? handleCreateUser : handleEditUser}
        mode={formMode}
      />

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        userName={userToDelete?.name || ""}
        onConfirm={handleDeleteUser}
      />

      <UserDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        user={selectedUser}
      />

      <ImportUsersDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportUsers}
      />
    </div>
  )
}
