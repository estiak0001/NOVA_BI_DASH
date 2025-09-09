"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ModernInput } from "@/components/modern-input"
import { ModernTextarea } from "@/components/modern-textarea"
import { useToast } from "@/hooks/use-toast"
import { Shield } from "lucide-react"

export interface Permission {
  id: number
  resource: string
  read: boolean
  write: boolean
  delete: boolean
}

export interface Role {
  id: number
  name: string
  description: string
  userCount: number
  permissions: string[]
  color: "default" | "secondary" | "destructive" | "outline"
  resourcePermissions?: { [key: string]: string[] }
}

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  permissions: Permission[]
  onSave: (role: Omit<Role, 'id' | 'userCount'>) => void
}

const roleColors = [
  { value: "default", label: "Default", color: "bg-primary" },
  { value: "secondary", label: "Secondary", color: "bg-secondary" },
  { value: "destructive", label: "Destructive", color: "bg-destructive" },
  { value: "outline", label: "Outline", color: "bg-muted" },
]

export function RoleFormDialog({ 
  open, 
  onOpenChange, 
  role, 
  permissions, 
  onSave 
}: RoleFormDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "default" as Role['color'],
    resourcePermissions: {} as { [key: string]: string[] }
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        color: role.color,
        resourcePermissions: role.resourcePermissions || {}
      })
    } else {
      setFormData({
        name: "",
        description: "",
        color: "default",
        resourcePermissions: {}
      })
    }
    setErrors({})
  }, [role, open])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required"
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Role description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePermissionChange = (resource: string, permission: string, checked: boolean) => {
    setFormData(prev => {
      const resourcePerms = prev.resourcePermissions[resource] || []
      const newResourcePerms = checked 
        ? [...resourcePerms, permission]
        : resourcePerms.filter(p => p !== permission)
      
      return {
        ...prev,
        resourcePermissions: {
          ...prev.resourcePermissions,
          [resource]: newResourcePerms
        }
      }
    })
  }

  const isPermissionChecked = (resource: string, permission: string) => {
    return formData.resourcePermissions[resource]?.includes(permission) || false
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // Convert resource permissions to simple permissions array
    const allPermissions = new Set<string>()
    Object.values(formData.resourcePermissions).forEach(perms => {
      perms.forEach(perm => allPermissions.add(perm))
    })

    const roleData = {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      permissions: Array.from(allPermissions),
      resourcePermissions: formData.resourcePermissions
    }

    onSave(roleData)
    onOpenChange(false)
    
    toast({
      title: role ? "Role Updated" : "Role Created",
      description: role 
        ? `Role "${formData.name}" has been updated successfully.`
        : `Role "${formData.name}" has been created successfully.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {role ? "Edit Role" : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            {role ? "Update the role details and permissions." : "Create a new role with specific permissions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <ModernInput
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter role name"
              error={errors.name}
            />

            <ModernTextarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter role description"
              error={errors.description}
            />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Role Color</h3>
              <div className="grid grid-cols-2 gap-3">
                {roleColors.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: colorOption.value as Role['color'] }))}
                    className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                      formData.color === colorOption.value 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${colorOption.color}`} />
                    <span className="text-sm">{colorOption.label}</span>
                    {formData.color === colorOption.value && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Permissions</h3>
            <div className="space-y-3">
              {permissions.map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{resource.resource}</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {["read", "write", "delete"].map((permission) => (
                      <label 
                        key={permission} 
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={isPermissionChecked(resource.resource, permission)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(resource.resource, permission, !!checked)
                          }
                        />
                        <span className="text-sm capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Permissions Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Permission Summary</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(formData.resourcePermissions).map(([resource, perms]) => 
                perms.map(perm => (
                  <Badge 
                    key={`${resource}-${perm}`} 
                    variant="outline"
                    className="text-xs"
                  >
                    {resource}: {perm}
                  </Badge>
                ))
              )}
              {Object.keys(formData.resourcePermissions).length === 0 && (
                <p className="text-sm text-muted-foreground">No permissions selected</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {role ? "Update Role" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
