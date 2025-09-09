"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { User } from "@/components/user-form"

interface ImportUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (users: Partial<User>[]) => void
}

export function ImportUsersDialog({
  open,
  onOpenChange,
  onImport,
}: ImportUsersDialogProps) {
  const [_selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<Partial<User>[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrors(['Please select a CSV file'])
      return
    }

    setSelectedFile(file)
    parseCSV(file)
  }

  const parseCSV = async (file: File) => {
    setIsProcessing(true)
    setErrors([])

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        setErrors(['CSV file must contain at least a header and one data row'])
        setIsProcessing(false)
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['name', 'email']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        setErrors([`Missing required columns: ${missingHeaders.join(', ')}`])
        setIsProcessing(false)
        return
      }

      const users: Partial<User>[] = []
      const parseErrors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        
        if (values.length !== headers.length) {
          parseErrors.push(`Row ${i + 1}: Column count mismatch`)
          continue
        }

        const user: Partial<User> = {}
        
        headers.forEach((header, index) => {
          const value = values[index]
          
          switch (header) {
            case 'name':
              user.name = value
              break
            case 'email':
              user.email = value
              break
            case 'role':
              user.role = value || 'Viewer'
              break
            case 'status':
              user.status = value || 'Active'
              break
            case 'phone':
              user.phone = value
              break
            case 'department':
              user.department = value
              break
            case 'bio':
              user.bio = value
              break
          }
        })

        // Validate required fields
        if (!user.name || !user.email) {
          parseErrors.push(`Row ${i + 1}: Missing name or email`)
          continue
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
          parseErrors.push(`Row ${i + 1}: Invalid email format`)
          continue
        }

        // Set defaults
        user.role = user.role || 'Viewer'
        user.status = user.status || 'Active'

        users.push(user)
      }

      setPreviewData(users)
      setErrors(parseErrors)
      
    } catch (_error) {
      setErrors(['Failed to parse CSV file'])
    }

    setIsProcessing(false)
  }

  const handleImport = () => {
    if (previewData.length === 0) return

    onImport(previewData)
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewData([])
    setErrors([])
    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'name,email,role,status,phone,department,bio\nShahriar Shawon,john@example.com,Editor,Active,+1234567890,IT,Sample bio'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user-import-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple users at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">
                  Download a CSV template with the required format
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Import Errors</span>
              </div>
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <ul className="text-sm text-destructive space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({previewData.length} users to import)</Label>
              <div className="border rounded-md max-h-40 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 p-3 text-xs font-medium bg-muted/50">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                </div>
                {previewData.slice(0, 10).map((user, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 p-3 text-sm border-t">
                    <div className="truncate">{user.name}</div>
                    <div className="truncate">{user.email}</div>
                    <div className="truncate">{user.role}</div>
                  </div>
                ))}
                {previewData.length > 10 && (
                  <div className="p-3 text-xs text-muted-foreground border-t">
                    ... and {previewData.length - 10} more users
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={previewData.length === 0 || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Import ${previewData.length} Users`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
