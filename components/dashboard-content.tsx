"use client"

import { useEffect, useState } from "react"
import { useSidebarContext } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

interface DashboardContentProps {
  children: React.ReactNode
  header: React.ReactNode
}

export function DashboardContent({ children, header }: DashboardContentProps) {
  const { isCollapsed, isLoaded } = useSidebarContext()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render until localStorage is loaded to prevent hydration mismatch
  if (!isLoaded || !isMounted) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:ml-64 transition-all duration-300">
          {header}
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none md:ml-64 transition-all duration-300">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div 
        className={cn(
          "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        {header}
      </div>
      <main 
        className={cn(
          "flex-1 relative overflow-y-auto focus:outline-none",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
