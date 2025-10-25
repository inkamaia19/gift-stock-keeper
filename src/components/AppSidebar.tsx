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
import { BarChart3, Folder, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "Dashboard", icon: BarChart3, href: "/", active: true },
];

// Removed Documents section for a cleaner, minimal sidebar

export function AppSidebar({ onAction }: { onAction: (action: string) => void }) {
  const { isCollapsed } = useSidebar();
  const iconClass = isCollapsed ? "h-6 w-6" : "h-5 w-5";
  return (
    <Sidebar className="bg-sidebar border-r border-sidebar-border">
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
        {/* Documents and Quick Actions removed for a minimal look */}
      </SidebarContent>
    </Sidebar>
  );
}
