"use client"

import React, { createContext, useContext } from "react"
import { useSidebar } from "@/hooks/use-sidebar"

interface SidebarContextType {
  isCollapsed: boolean
  toggle: () => void
  isLoaded: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebarState = useSidebar()

  return (
    <SidebarContext.Provider value={sidebarState}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider")
  }
  return context
}
