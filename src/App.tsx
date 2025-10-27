// --- START OF FILE src/App.tsx ---

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ActionProvider } from "./contexts/ActionContext"
import { AuthProvider } from "./contexts/AuthContext"

import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import { Layout } from "./layouts/Layout"
import Login from "./pages/Login"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
})

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ActionProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ActionProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App

// --- END OF FILE src/App.tsx ---
