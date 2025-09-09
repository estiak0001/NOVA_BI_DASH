"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Role } from "./role-form-dialog"

interface DeleteRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onDelete: (roleId: number) => void
}

export function DeleteRoleDialog({ 
  open, 
  onOpenChange, 
  role, 
  onDelete 
}: DeleteRoleDialogProps) {
  const { toast } = useToast()

  const handleDelete = () => {
    if (!role) return

    onDelete(role.id)
    onOpenChange(false)
    
    toast({
      title: "Role Deleted",
      description: `Role "${role.name}" has been deleted successfully.`,
      variant: "destructive",
    })
  }

  if (!role) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Delete Role</DialogTitle>
          </div>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the role and remove it from all users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{role.name}</h4>
              <Badge variant={role.color}>
                {role.userCount} users
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </div>

          {role.userCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Warning</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                This role is currently assigned to {role.userCount} user{role.userCount > 1 ? 's' : ''}. 
                Deleting this role will remove it from all assigned users.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
