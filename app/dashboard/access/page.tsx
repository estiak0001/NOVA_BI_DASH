"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Key, Users, Settings, Eye, Plus, Edit, Trash2, MoreHorizontal, Search, Filter } from "lucide-react"
import { RoleFormDialog, type Role, type Permission } from "@/components/role-form-dialog"
import { DeleteRoleDialog } from "@/components/delete-role-dialog"
import { RoleDetailsDialog } from "@/components/role-details-dialog"
import { PermissionsManager } from "@/components/permissions-manager"
import { ModernSearch } from "@/components/modern-search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample permissions data
const initialPermissions: Permission[] = [
  { id: 1, resource: "Dashboard", read: true, write: false, delete: false },
  { id: 2, resource: "Users", read: true, write: true, delete: false },
  { id: 3, resource: "Analytics", read: true, write: false, delete: false },
  { id: 4, resource: "Settings", read: true, write: true, delete: true },
  { id: 5, resource: "Reports", read: true, write: true, delete: false },
]

const initialRoles: Role[] = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access with all permissions",
    userCount: 2,
    permissions: ["read", "write", "delete", "admin"],
    color: "destructive",
    resourcePermissions: {
      "Dashboard": ["read", "write", "delete"],
      "Users": ["read", "write", "delete"],
      "Analytics": ["read", "write", "delete"],
      "Settings": ["read", "write", "delete"],
      "Reports": ["read", "write", "delete"],
    }
  },
  {
    id: 2,
    name: "Admin",
    description: "Administrative access with most permissions",
    userCount: 5,
    permissions: ["read", "write", "delete"],
    color: "default",
    resourcePermissions: {
      "Dashboard": ["read"],
      "Users": ["read", "write", "delete"],
      "Analytics": ["read"],
      "Settings": ["read", "write"],
      "Reports": ["read", "write"],
    }
  },
  {
    id: 3,
    name: "Editor",
    description: "Can read and modify content",
    userCount: 12,
    permissions: ["read", "write"],
    color: "secondary",
    resourcePermissions: {
      "Dashboard": ["read"],
      "Users": ["read", "write"],
      "Analytics": ["read"],
      "Settings": ["read"],
      "Reports": ["read", "write"],
    }
  },
  {
    id: 4,
    name: "Viewer",
    description: "Read-only access to most resources",
    userCount: 25,
    permissions: ["read"],
    color: "outline",
    resourcePermissions: {
      "Dashboard": ["read"],
      "Users": ["read"],
      "Analytics": ["read"],
      "Settings": [],
      "Reports": ["read"],
    }
  },
]

export default function AccessControlPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions)
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [viewMode, setViewMode] = useState<'roles' | 'permissions'>('roles')
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "low-usage" | "high-usage">("all")

  // Filter roles based on search and filter criteria
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = roleFilter === "all" ||
                         (roleFilter === "low-usage" && role.userCount < 10) ||
                         (roleFilter === "high-usage" && role.userCount >= 10)
    
    return matchesSearch && matchesFilter
  })

  // CRUD Operations for Roles
  const handleCreateRole = (roleData: Omit<Role, 'id' | 'userCount'>) => {
    const newRole: Role = {
      ...roleData,
      id: Math.max(...roles.map(r => r.id)) + 1,
      userCount: 0,
    }
    setRoles(prev => [...prev, newRole])
  }

  const handleUpdateRole = (roleData: Omit<Role, 'id' | 'userCount'>) => {
    if (!selectedRole) return
    
    setRoles(prev => prev.map(role => 
      role.id === selectedRole.id 
        ? { ...roleData, id: selectedRole.id, userCount: selectedRole.userCount }
        : role
    ))
  }

  const handleDeleteRole = (roleId: number) => {
    setRoles(prev => prev.filter(role => role.id !== roleId))
  }

  const handleSaveRole = (roleData: Omit<Role, 'id' | 'userCount'>) => {
    if (selectedRole) {
      handleUpdateRole(roleData)
    } else {
      handleCreateRole(roleData)
    }
  }

  // Dialog handlers
  const openCreateDialog = () => {
    setSelectedRole(null)
    setShowRoleForm(true)
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setShowRoleForm(true)
  }

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role)
    setShowDeleteDialog(true)
  }

  const openDetailsDialog = (role: Role) => {
    setSelectedRole(role)
    setShowDetailsDialog(true)
  }

  const handlePermissionsUpdate = (updatedPermissions: Permission[]) => {
    setPermissions(updatedPermissions)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'roles' ? 'default' : 'outline'}
              onClick={() => setViewMode('roles')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Roles
            </Button>
            <Button
              variant={viewMode === 'permissions' ? 'default' : 'outline'}
              onClick={() => setViewMode('permissions')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Permissions
            </Button>
            {viewMode === 'roles' && (
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar for Roles */}
        {viewMode === 'roles' && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <ModernSearch
                placeholder="Search roles by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {roleFilter === "all" ? "All Roles" : 
                   roleFilter === "low-usage" ? "Low Usage" : "High Usage"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("low-usage")}>
                  Low Usage (&lt; 10 users)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("high-usage")}>
                  High Usage (≥ 10 users)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Resources</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Resources under access control
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users with Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.reduce((total: number, role: Role) => total + role.userCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total assigned users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'roles' ? (
        /* Roles Management */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Roles
                </CardTitle>
                <CardDescription>
                  {filteredRoles.length === roles.length 
                    ? `${roles.length} total roles configured`
                    : `${filteredRoles.length} of ${roles.length} roles shown`
                  }
                </CardDescription>
              </div>
              {searchQuery && (
                <Badge variant="outline">
                  Filtered: &quot;{searchQuery}&quot;
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredRoles.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-muted-foreground mb-2">No roles found</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {searchQuery 
                    ? `No roles match "${searchQuery}"`
                    : "No roles match the current filter"
                  }
                </p>
                {searchQuery && (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRoles.map((role) => (
                  <Card key={role.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              role.color === 'destructive' ? 'bg-destructive' :
                              role.color === 'default' ? 'bg-primary' :
                              role.color === 'secondary' ? 'bg-secondary' : 'bg-muted'
                            }`} />
                            {role.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {role.description}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetailsDialog(role)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(role)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={role.color as "default" | "secondary" | "destructive" | "outline"}>
                          <Users className="mr-1 h-3 w-3" />
                          {role.userCount} users
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {role.permissions.length} permissions
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(role)}
                          className="flex-1"
                        >
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDetailsDialog(role)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-3 w-3" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Permissions Management */
        <PermissionsManager 
          permissions={permissions}
          onSave={handlePermissionsUpdate}
        />
      )}

      {/* Dialogs */}
      <RoleFormDialog
        open={showRoleForm}
        onOpenChange={setShowRoleForm}
        role={selectedRole}
        permissions={permissions}
        onSave={handleSaveRole}
      />

      <DeleteRoleDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        role={selectedRole}
        onDelete={handleDeleteRole}
      />

      <RoleDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        role={selectedRole}
        permissions={permissions}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />
    </div>
  )
}
