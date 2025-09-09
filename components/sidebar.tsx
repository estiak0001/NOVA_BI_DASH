"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  Users, 
  Settings, 
  Menu, 
  Home,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { UserProfile } from "@/components/user-profile"
import { useSidebarContext } from "@/contexts/sidebar-context"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Access Control", href: "/dashboard/access", icon: Shield },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { isCollapsed, toggle, isLoaded } = useSidebarContext()

  // Don't render until localStorage is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return null
  }

  const SidebarContent = ({ showLabels = true }: { showLabels?: boolean }) => (
    <div className={cn(
      "flex h-full flex-col transition-all duration-300",
      showLabels ? "w-64" : "w-16"
    )}>
      <div className={cn(
        "flex h-14 items-center border-b px-4",
        showLabels ? "justify-between" : "justify-center"
      )}>
        {showLabels ? (
          <>
            <Link className="flex items-center space-x-2" href="/dashboard">
              <BarChart3 className="h-6 w-6" />
              <span className="font-bold">SysNova Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-8 w-8 hover:bg-accent transition-colors duration-200 flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-8 w-8 hover:bg-accent transition-colors duration-200"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative",
                showLabels ? "space-x-3" : "justify-center",
                pathname === item.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={!showLabels ? item.name : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {showLabels && <span className="truncate">{item.name}</span>}
              {!showLabels && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </div>
      <div className="border-t">
        <div className="p-4">
          {showLabels && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          )}
          {!showLabels && (
            <div className="flex justify-center mb-3">
              <ThemeToggle />
            </div>
          )}
          <UserProfile collapsed={!showLabels} />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300",
        isCollapsed ? "md:w-16" : "md:w-64"
      )}>
        <div className="flex-1 flex flex-col min-h-0 border-r bg-card">
          <SidebarContent showLabels={!isCollapsed} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent showLabels={true} />
        </SheetContent>
      </Sheet>
    </>
  )
}
