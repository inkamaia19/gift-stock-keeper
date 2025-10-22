// --- START OF FILE src/layouts/Layout.tsx ---

import { Outlet } from "react-router-dom"
// Asegúrate de que esta línea NO tenga la extensión .tsx al final
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export const Layout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}

// --- END OF FILE src/layouts/Layout.tsx ---