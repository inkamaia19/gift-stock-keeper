// --- START OF FILE src/components/ui/sidebar.tsx ---

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { AnimatePresence, motion, useAnimation, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_COLLAPSED_WIDTH = "5rem" // Un poco más de espacio para los iconos

// --- Context ---
interface SidebarContextProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}
const SidebarContext = React.createContext<SidebarContextProps | undefined>(undefined)

const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// --- Provider ---
const SidebarProvider = ({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  return <SidebarContext.Provider value={{ isOpen, setIsOpen }}>{children}</SidebarContext.Provider>
}

// --- Main Sidebar Component ---
const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { isOpen } = useSidebar()
  return (
    <motion.aside
      ref={ref}
      initial={false}
      animate={{ width: isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      // === CORRECCIÓN CLAVE: Usar variables de color del sidebar ===
      className={cn("h-screen flex flex-col border-r bg-sidebar text-sidebar-foreground", className)}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"

// --- Header ---
const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-16 items-center border-b border-sidebar-border p-4", className)} {...props} />
))
SidebarHeader.displayName = "SidebarHeader"

// --- Content ---
const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-y-auto", className)} {...props} />
))
SidebarContent.displayName = "SidebarContent"

// --- Group ---
const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-2", className)} {...props} />
))
SidebarGroup.displayName = "SidebarGroup"

// --- Menu Item ---
const menuItemVariants = cva("flex items-center justify-start rounded-lg text-sm font-medium transition-colors", {
  variants: {
    isActive: {
      true: "bg-sidebar-primary text-sidebar-primary-foreground",
      false: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    },
    isOpen: {
      true: "px-4 py-2",
      false: "h-12 w-12 justify-center",
    },
  },
  defaultVariants: {
    isActive: false,
    isOpen: true,
  },
})

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof menuItemVariants> {
  asChild?: boolean
}

const SidebarMenuItem = React.forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  ({ className, isActive, asChild = false, children, ...props }, ref) => {
    const { isOpen } = useSidebar()
    const Comp = asChild ? Slot : "div"
    return (
      <Comp ref={ref} className={cn(menuItemVariants({ isActive, isOpen }), className)} {...props}>
        {children}
      </Comp>
    )
  }
)
SidebarMenuItem.displayName = "SidebarMenuItem"

// --- Menu Label (con animación de aparición) ---
const SidebarMenuLabel = React.forwardRef<HTMLSpanElement, HTMLMotionProps<"span">>(({ className, ...props }, ref) => {
    const { isOpen } = useSidebar();
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.span
            ref={ref}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.2 } }}
            exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
            className={cn("ml-3 truncate", className)}
            {...props}
          />
        )}
      </AnimatePresence>
    );
});
SidebarMenuLabel.displayName = "SidebarMenuLabel";

// --- Trigger ---
const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => {
  const { isOpen, setIsOpen } = useSidebar()
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("rounded-full", className)}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", !isOpen && "rotate-180")} />
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenuItem,
  SidebarMenuLabel,
  SidebarTrigger,
}

// --- END OF FILE src/components/ui/sidebar.tsx ---