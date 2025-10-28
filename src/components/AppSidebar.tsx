// --- START OF FILE src/components/AppSidebar.tsx (CORREGIDO) ---

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton, 
  SidebarMenu,       
  SidebarGroup,
  useSidebar,
} from "@/components/ui/sidebar";
import { BarChart3, Folder, Circle, UserCog } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const mainNav = [
  { title: "Dashboard", icon: BarChart3, href: "/", active: true },
];

// Removed Documents section for a cleaner, minimal sidebar

export function AppSidebar({ onAction }: { onAction: (action: string) => void }) {
  const { isCollapsed } = useSidebar();
  const { state } = useAuth();
  const iconClass = isCollapsed ? "h-6 w-6" : "h-5 w-5";
  return (
    <Sidebar className="bg-sidebar border-r border-sidebar-border sticky top-0 h-screen shrink-0 flex flex-col justify-between">
      <SidebarHeader className="border-b border-sidebar-border flex justify-center items-center">
        <div className={cn("flex items-center", isCollapsed ? "gap-0" : "gap-2")}> 
          <Circle className="h-7 w-7 text-foreground" />
          {!isCollapsed && (
            <SidebarMenu className="text-lg font-semibold">Myself</SidebarMenu>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup className="py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            <SidebarMenu>Home</SidebarMenu>
          </h3>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.active}>
                <Link to={item.href}>
                  <item.icon className={iconClass} />
                  {/* CAMBIO CLAVE: Envolver el texto en SidebarMenu */}
                  <SidebarMenu>{item.title}</SidebarMenu>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {/* Catalog entry opens the catalog sheet via action */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => onAction("openCatalog")}>
              <Folder className={iconClass} />
              <SidebarMenu>Catalog</SidebarMenu>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>
      {/* Fixed bottom user footer */}
      <div className="border-t border-sidebar-border px-3 py-3 text-xs text-muted-foreground">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="truncate">
              <span className="block truncate">{state.username || 'Usuario'}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-md px-2 py-1 text-foreground hover:bg-accent hover:text-accent-foreground">
                <UserCog className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {state.username === 'inka-maia' && (
                  <>
                    <DropdownMenuItem onClick={async ()=>{
                      const target = prompt('Usuario a crear/actualizar:')?.trim()
                      if (!target) return
                      const code = prompt('Nuevo código de 6 dígitos:')?.trim()
                      if (!code) return
                      if (!/^\d{6}$/.test(code)) { alert('Código inválido'); return }
                      try {
                        const res = await fetch('/api/auth/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: target, code }) })
                        if (!res.ok) throw new Error(await res.text())
                        location.reload()
                      } catch (e:any) { alert(e?.message || 'Error') }
                    }}>Crear usuario</DropdownMenuItem>
                    <DropdownMenuItem onClick={async ()=>{
                      const target = prompt('Usuario a modificar:')?.trim()
                      if (!target) return
                      const code = prompt('Nuevo código de 6 dígitos:')?.trim()
                      if (!code) return
                      if (!/^\d{6}$/.test(code)) { alert('Código inválido'); return }
                      try {
                        const res = await fetch(`/api/auth/users/${encodeURIComponent(target)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
                        if (!res.ok) throw new Error(await res.text())
                        location.reload()
                      } catch (e:any) { alert(e?.message || 'Error') }
                    }}>Modificar contraseña</DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={async ()=>{ try { await fetch('/api/auth/logout', { method: 'POST' }); location.href='/login' } catch {} }}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <button
            title={state.username || 'Usuario'}
            onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/login'; } catch {} }}
            className="mx-auto block rounded-md p-1 text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            ⎋
          </button>
        )}
      </div>
    </Sidebar>
  );
}
