"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield, Edit, Trash2 } from "lucide-react"
import type { Role, Permission } from "./role-form-dialog"

interface RoleDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  permissions: Permission[]
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleDetailsDialog({ 
  open, 
  onOpenChange, 
  role, 
  permissions,
  onEdit,
  onDelete
}: RoleDetailsDialogProps) {
  if (!role) return null

  const getResourcePermissions = (resource: string) => {
    return role.resourcePermissions?.[resource] || []
  }

  const hasAnyPermissions = (resource: string) => {
    return getResourcePermissions(resource).length > 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {role.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {role.description}
              </DialogDescription>
            </div>
            <Badge variant={role.color} className="ml-2">
              {role.userCount} users
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{role.userCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{role.permissions.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permissions Overview</h3>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          {/* Detailed Resource Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Resource Permissions</h3>
            <div className="space-y-3">
              {permissions.map((resource) => {
                const resourcePerms = getResourcePermissions(resource.resource)
                return (
                  <div key={resource.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{resource.resource}</h4>
                      {!hasAnyPermissions(resource.resource) && (
                        <Badge variant="outline" className="text-muted-foreground">
                          No access
                        </Badge>
                      )}
                    </div>
                    {hasAnyPermissions(resource.resource) && (
                      <div className="flex gap-2">
                        {resourcePerms.map((perm) => (
                          <Badge 
                            key={perm} 
                            variant={
                              perm === "delete" ? "destructive" : 
                              perm === "write" ? "default" : "secondary"
                            }
                          >
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                onEdit(role)
                onOpenChange(false)
              }}
              className="flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                onDelete(role)
                onOpenChange(false)
              }}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Role
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
