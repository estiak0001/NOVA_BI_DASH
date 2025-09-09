"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock user data - in a real app, this would come from authentication context
const currentUser = {
  name: "Shahriar Shawon",
  email: "shahriar.shawon@sysnova.com",
  role: "Admin",
  avatar: "",
  lastLogin: "2025-01-01 14:30",
  status: "online"
}

export function UserProfile({ collapsed = false }: { collapsed?: boolean }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    // Simulate logout process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real app, you'd clear authentication tokens here
    // For demo purposes, redirect to sign-in
    window.location.href = "/signin"
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "destructive"
      case "Editor": return "default"
      case "Viewer": return "secondary"
      default: return "secondary"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "relative h-12 w-full space-x-3 px-3",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="bg-blue-500 text-white text-sm">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            {currentUser.status === "online" && (
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium leading-none">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getRoleBadgeColor(currentUser.role) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                    {currentUser.role}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Last login: {currentUser.lastLogin}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
