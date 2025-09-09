"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Save, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Permission } from "./role-form-dialog"

interface PermissionsManagerProps {
  permissions: Permission[]
  onSave: (permissions: Permission[]) => void
}

export function PermissionsManager({ permissions, onSave }: PermissionsManagerProps) {
  const { toast } = useToast()
  const [localPermissions, setLocalPermissions] = useState<Permission[]>(permissions)
  const [hasChanges, setHasChanges] = useState(false)

  const togglePermission = (resourceId: number, permissionType: 'read' | 'write' | 'delete') => {
    setLocalPermissions(prev => {
      const updated = prev.map(resource => 
        resource.id === resourceId 
          ? { ...resource, [permissionType]: !resource[permissionType] }
          : resource
      )
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(permissions))
      return updated
    })
  }

  const handleSave = () => {
    onSave(localPermissions)
    setHasChanges(false)
    toast({
      title: "Permissions Updated",
      description: "Default permissions have been saved successfully.",
    })
  }

  const handleReset = () => {
    setLocalPermissions(permissions)
    setHasChanges(false)
    toast({
      title: "Changes Discarded",
      description: "All changes have been reset to the last saved state.",
    })
  }

  const getPermissionsBadgeVariant = (resource: Permission) => {
    const activePerms = [resource.read, resource.write, resource.delete].filter(Boolean).length
    if (activePerms === 3) return "default"
    if (activePerms === 2) return "secondary"
    if (activePerms === 1) return "outline"
    return "destructive"
  }

  const getPermissionsText = (resource: Permission) => {
    const perms = []
    if (resource.read) perms.push("Read")
    if (resource.write) perms.push("Write")
    if (resource.delete) perms.push("Delete")
    return perms.length > 0 ? perms.join(", ") : "No access"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Default Permissions</CardTitle>
            <CardDescription>
              Configure default permissions for system resources
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {localPermissions.map((resource) => (
            <Card key={resource.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{resource.resource}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  variant={getPermissionsBadgeVariant(resource)}
                  className="text-xs"
                >
                  {getPermissionsText(resource)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Permissions Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead className="text-center">Read</TableHead>
                <TableHead className="text-center">Write</TableHead>
                <TableHead className="text-center">Delete</TableHead>
                <TableHead>Permissions Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localPermissions.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">
                    {resource.resource}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={resource.read}
                      onCheckedChange={() => togglePermission(resource.id, 'read')}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={resource.write}
                      onCheckedChange={() => togglePermission(resource.id, 'write')}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={resource.delete}
                      onCheckedChange={() => togglePermission(resource.id, 'delete')}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {resource.read && (
                        <Badge variant="secondary" className="text-xs">Read</Badge>
                      )}
                      {resource.write && (
                        <Badge variant="default" className="text-xs">Write</Badge>
                      )}
                      {resource.delete && (
                        <Badge variant="destructive" className="text-xs">Delete</Badge>
                      )}
                      {!resource.read && !resource.write && !resource.delete && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          No access
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {hasChanges && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You have unsaved changes. Click &quot;Save Changes&quot; to apply them or &quot;Reset&quot; to discard.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
