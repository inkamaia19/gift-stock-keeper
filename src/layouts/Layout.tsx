// --- START OF FILE src/layouts/Layout.tsx (CORREGIDO) ---

import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useActions } from "@/contexts/ActionContext"; 

export const Layout = () => {
  const { setIsCatalogOpen, setIsBundleSaleOpen } = useActions();

  const handleSidebarAction = (action: string) => {
    if (action === "openCatalog") {
      setIsCatalogOpen(true);
    } else if (action === "openBundle") {
      setIsBundleSaleOpen(true);
    }
  };
  
  return (
    <SidebarProvider>
      {/* Esta estructura es la correcta. El flexbox se encarga de todo. */}
      <div className="flex min-h-screen"> 
        <AppSidebar onAction={handleSidebarAction} />
        <main className="flex-1 overflow-y-auto"> 
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
