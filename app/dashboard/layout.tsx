import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardContent } from "@/components/dashboard-content"
import { SidebarProvider } from "@/contexts/sidebar-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <DashboardContent header={<DashboardHeader />}>
          <div className="md:hidden mb-4">
            <Sidebar />
          </div>
          {children}
        </DashboardContent>
      </div>
    </SidebarProvider>
  )
}
