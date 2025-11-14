import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorldAppProvider } from "@/contexts/WorldAppContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Outlet, Navigate } from "react-router-dom";
import { useWorldApp } from '@/contexts/WorldAppContext';
import { Loader2 } from 'lucide-react';
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
import SellerOnboarding from "./pages/SellerOnboarding";
import ProductPreview from "./pages/ProductPreview";
import EditProfile from "./pages/EditProfile";
import EditProduct from "./pages/EditProduct";
import Favorites from "./pages/Favorites";
import BuyerGuide from "./pages/BuyerGuide";
import MiniKitProvider from "./providers//minikit-provider";
import Admin from "./pages/Admin";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminListings from "./pages/admin/AdminListings";
import AdminCategories from "./pages/admin/AdminCategories";
import { useUserRole } from "./hooks/useUserRole";


const queryClient = new QueryClient();

function ProtectedLayout() {
  const { user, isLoading } = useWorldApp();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return user ? 
  <div>
      <Outlet />
      <BottomNavigation />
    </div>
  : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useWorldApp();
  const { data: userRole, isLoading: roleLoading } = useUserRole();
  
  if (isLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (userRole !== 'admin') return <Navigate to="/" replace />;
  
  return <>{children}</>;
}


// import('eruda').then((module) => {
//         module.default.init();
//       });


const App = () => (
  <QueryClientProvider client={queryClient}>
    <MiniKitProvider>
    <WorldAppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:slug" element={<Categories />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:id" element={<ChatConversation />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/seller-onboarding" element={<SellerOnboarding />} />
              <Route path="/list-product" element={<ListProduct />} />
              <Route path="/list-product/:id/preview" element={<ProductPreview />} />
              <Route path="/list-product/:id/payment" element={<ListingPayment />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/edit-product/:id" element={<EditProduct />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/buyer-guide" element={<BuyerGuide />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/admin/config" element={<AdminRoute><AdminConfig /></AdminRoute>} />
              <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
              <Route path="/admin/listings" element={<AdminRoute><AdminListings /></AdminRoute>} />
              <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
          
            </Routes>

            
          </div>
        </BrowserRouter>
  
      </TooltipProvider>
    </WorldAppProvider>
    </MiniKitProvider>
  </QueryClientProvider>
);

export default App;