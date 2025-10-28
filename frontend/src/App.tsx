import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WishlistProvider } from './context/WishlistContext';
import Index from "./pages/Index";
import About from "./pages/About";
import Collections from "./pages/Collections";
import KnifeDetail from "./pages/KnifeDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Overview from "./pages/admin/Overview";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Inventory from "./pages/admin/Inventory";
import Customers from "./pages/admin/Customers";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import UserLogin from "./pages/UserLogin";
import AddProduct from '@/pages/admin/AddProduct';
import EditProduct from '@/pages/admin/EditProduct';
import { AccountLayout } from './pages/account/AccountLayout';
import { Profile } from './pages/account/Profile';
import { OrderHistory } from './pages/account/OrderHistory';
import { Addresses } from './pages/account/Addresses';
import { Security } from './pages/account/Security';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WishlistProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/knives/:category" element={<Collections />} />
              <Route path="/knife/:id" element={<KnifeDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<UserLogin />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />}>
                <Route index element={<Overview />} />
                <Route path="products" element={<Products />} />
                <Route path="products/new" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="orders" element={<Orders />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="customers" element={<Customers />} />
              </Route>
                
              {/* Account Routes */}
              <Route path="/account" element={<AccountLayout />}>
                <Route path="profile" element={<Profile />} />
                <Route path="orders" element={<OrderHistory />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="security" element={<Security />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;