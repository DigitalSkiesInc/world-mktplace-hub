import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WorldAppProvider } from "@/contexts/WorldAppContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Outlet, Navigate } from "react-router-dom";
import { useWorldApp } from '@/contexts/WorldAppContext';
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { MiniKit } from "@worldcoin/minikit-js";
import React, {  useEffect } from 'react';


const queryClient = new QueryClient();

function ProtectedLayout() {
  const { user, isLoading } = useWorldApp();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <Outlet />
      <BottomNavigation />
    </>
  );
}

const App = () => {
  useEffect(() => {
    // ✅ Install MiniKit when app starts
    MiniKit.install(import.meta.env.VITE_APP_ID);
  }, []);


return (
  <QueryClientProvider client={queryClient}>
    <WorldAppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:slug" element={<Categories />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:id" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WorldAppProvider>
  </QueryClientProvider>
);
}

export default App;
