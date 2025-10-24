import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Slot } from "@radix-ui/react-slot"; // <-- 1. IMPORTAR SLOT
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// --- CONTEXT ---
interface SidebarContextProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}
const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
}

// --- PROVIDER ---
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(isMobile);

  React.useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// --- STYLES ---
const sidebarVariants = cva(
  "flex flex-col overflow-hidden will-change-[width] transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)]",
  {
    variants: {
      isCollapsed: {
        true: "w-16",
        false: "w-60",
      },
    },
    defaultVariants: {
      isCollapsed: false,
    },
  }
);

// --- SIDEBAR ROOT ---
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sidebarVariants>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  return (
    <aside
      ref={ref}
      className={cn(sidebarVariants({ isCollapsed }), className)}
      {...props}
    />
  );
});
Sidebar.displayName = "Sidebar";

// --- SIDEBAR TRIGGER ---
const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  return (
    <button
      ref={ref}
      onClick={() => setIsCollapsed((prev) => !prev)}
      className={cn("h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground", className)}
      {...props}
    >
      {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

// --- OTHER COMPONENTS ---
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-16 items-center px-4 shrink-0", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarMenu = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  return (
    <span
      ref={ref}
      className={cn(
        "whitespace-nowrap overflow-hidden transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)]",
        isCollapsed ? "opacity-0 w-0 -translate-x-1" : "opacity-100 translate-x-0",
        className
      )}
      {...props}
    />
  );
});
SidebarMenu.displayName = "SidebarMenu";

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-3", className)} {...props} />
));
SidebarGroup.displayName = "SidebarGroup";

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("my-1", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement, // Ref will be on a button or an element passed via Slot
  React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean; asChild?: boolean }
>(({ className, isActive, asChild = false, ...props }, ref) => {
  const { isCollapsed } = useSidebar();
  // <-- 2. USAR SLOT CUANDO asChild ES TRUE
  const Comp = asChild ? Slot : "button"; 
  return (
    <Comp
      ref={ref}
      data-active={isActive}
      className={cn(
        "flex items-center gap-3 rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed && "justify-center w-12 h-12 p-0",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
};  
