"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  MoreHorizontal, 
  Trash2, 
  UserCheck, 
  UserX, 
  Shield,
  Download,
  ChevronDown
} from "lucide-react"
import { User } from "@/components/user-form"

interface BulkActionsProps {
  selectedUsers: User[]
  onBulkDelete: (userIds: number[]) => void
  onBulkStatusUpdate: (userIds: number[], status: string) => void
  onBulkRoleUpdate: (userIds: number[], role: string) => void
  onExportUsers: (users: User[]) => void
  onDeselectAll: () => void
}

const roles = ["Admin", "Editor", "Viewer"]
const statuses = ["Active", "Inactive"]

export function BulkActions({
  selectedUsers,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkRoleUpdate,
  onExportUsers,
  onDeselectAll,
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleBulkDelete = () => {
    onBulkDelete(selectedUsers.map(u => u.id))
    setShowDeleteDialog(false)
  }

  const handleExport = () => {
    onExportUsers(selectedUsers)
  }

  if (selectedUsers.length === 0) return null

  return (
    <>
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-medium">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDeselectAll}
          >
            Deselect All
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <UserCheck className="h-4 w-4 mr-2" />
                Change Status
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Bulk Status Change</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statuses.map(status => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onBulkStatusUpdate(selectedUsers.map(u => u.id), status)}
                >
                  {status === "Active" ? (
                    <UserCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <UserX className="h-4 w-4 mr-2" />
                  )}
                  Mark as {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Change Role
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Bulk Role Change</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roles.map(role => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => onBulkRoleUpdate(selectedUsers.map(u => u.id), role)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Set as {role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Users</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Users to be deleted:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedUsers.map(user => (
                  <div key={user.id} className="text-sm text-muted-foreground">
                    • {user.name} ({user.email})
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Delete {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
