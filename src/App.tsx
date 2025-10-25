// --- START OF FILE src/App.tsx ---

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ActionProvider } from "./contexts/ActionContext" // NUEVA IMPORTACIÓN

import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import { Layout } from "./layouts/Layout"
import { useEffect } from "react"
import { initBackupSync } from "@/lib/backup"

const queryClient = new QueryClient()

const App = () => {
  useEffect(() => {
    const dispose = initBackupSync();
    return () => { dispose?.(); };
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ActionProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ActionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App

// --- END OF FILE src/App.tsx ---
