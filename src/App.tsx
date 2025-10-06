import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorldAppProvider } from "@/contexts/WorldAppContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Outlet, Navigate } from "react-router-dom";
import { useWorldApp } from '@/contexts/WorldAppContext';
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Chat from "./pages/Chat";
import ChatConversation from "./pages/ChatConversation";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ListProduct from "./pages/ListProduct";
import ListingPayment from "./pages/ListingPayment";
import MyListings from "./pages/MyListings";


const queryClient = new QueryClient();

function ProtectedLayout() {
  const { user, isLoading } = useWorldApp();
  if (isLoading) return <p>Loading…</p>;
  return user ? 
  <div>
      <Outlet />
      <BottomNavigation />
    </div>
  : <Navigate to="/login" replace />;
}


const App = () => (
  <QueryClientProvider client={queryClient}>
    <WorldAppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* <Route path="/login" element={<Login />} /> */}
              {/* <Route element={<ProtectedLayout />}> */}
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:slug" element={<Categories />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:id" element={<ChatConversation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/list-product" element={<ListProduct />} />
              <Route path="/list-product/:id/payment" element={<ListingPayment />} />
              <Route path="/my-listings" element={<MyListings />} />
              {/* </Route> */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
          </div>
        </BrowserRouter>
  
      </TooltipProvider>
    </WorldAppProvider>
  </QueryClientProvider>
);

export default App;