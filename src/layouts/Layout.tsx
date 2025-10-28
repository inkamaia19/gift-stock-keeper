// --- START OF FILE src/layouts/Layout.tsx (CORREGIDO) ---

import { Outlet, Navigate, useLocation } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useActions } from "@/contexts/ActionContext"; 
import { useAuth } from "@/contexts/AuthContext";

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
          {(() => {
            const { state } = useAuth();
            const loc = useLocation();
            if (state.loading) {
              return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Cargando sesión…</div>
            }
            if (!state.authenticated) {
              return <Navigate to="/login" state={{ from: loc.pathname }} replace />
            }
            return <Outlet />
          })()}
        </main>
      </div>
    </SidebarProvider>
  )
}
