// --- START OF FILE src/components/AppSidebar.tsx ---

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { BarChart3, LayoutGrid, GanttChartSquare, Presentation, Folder, Users, Database, FileText, Bot, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "Dashboard", icon: BarChart3, href: "#", active: true },
  { title: "Lifecycle", icon: GanttChartSquare, href: "#" },
  { title: "Analytics", icon: Presentation, href: "#" },
  { title: "Projects", icon: Folder, href: "#" },
  { title: "Team", icon: Users, href: "#" },
];

const docsNav = [
  { title: "Data Library", icon: Database, href: "#" },
  { title: "Reports", icon: FileText, href: "#" },
  { title: "Word Assistant", icon: Bot, href: "#" },
];

export function AppSidebar() {
  return (
    // Usamos bg-card para el fondo blanco y un borde derecho explícito
    <Sidebar className="bg-card border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <Circle className="h-6 w-6" />
          <SidebarMenuLabel className="text-lg font-semibold">Acme Inc.</SidebarMenuLabel>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="py-2">
          <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Home</h3>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.title} isActive={item.active} asChild>
              <a href={item.href}>
                <item.icon className="h-4 w-4" />
                <SidebarMenuLabel>{item.title}</SidebarMenuLabel>
              </a>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
        <SidebarGroup className="py-2">
          <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Documents</h3>
          {docsNav.map((item) => (
            <SidebarMenuItem key={item.title} isActive={item.active} asChild>
              <a href={item.href}>
                <item.icon className="h-4 w-4" />
                <SidebarMenuLabel>{item.title}</SidebarMenuLabel>
              </a>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// --- END OF FILE src/components/AppSidebar.tsx ---