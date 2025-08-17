import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";

// Main Pages
import Index from "./pages/Index";

// Beautiful Role-Based Auth Pages
import CustomerSignIn from "./pages/auth/CustomerSignIn";
import CustomerSignUp from "./pages/auth/CustomerSignUp";
import MerchantSignIn from "./pages/auth/MerchantSignIn";
import MerchantSignUp from "./pages/auth/MerchantSignUp";
import RiderSignIn from "./pages/auth/RiderSignIn";
import RiderSignUp from "./pages/auth/RiderSignUp";


// Dashboard Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import StoresPage from "./pages/customer/StoresPage";
import FreshPage from "./pages/customer/FreshPage";
import RestaurantsPage from "./pages/customer/RestaurantsPage";
import ConciergePage from "./pages/customer/ConciergePage";
import MultiStopOrdersPage from "./pages/customer/MultiStopOrdersPage";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import RiderDashboard from "./pages/rider/RiderDashboard";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/customer/signin" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          
          {/* Customer Auth Routes */}
          <Route path="/auth/customer/signin" element={<CustomerSignIn />} />
          <Route path="/auth/customer/signup" element={<CustomerSignUp />} />
          
          {/* Merchant Auth Routes */}
          <Route path="/auth/merchant/signin" element={<MerchantSignIn />} />
          <Route path="/auth/merchant/signup" element={<MerchantSignUp />} />
          
          {/* Rider Auth Routes */}
          <Route path="/auth/rider/signin" element={<RiderSignIn />} />
          <Route path="/auth/rider/signup" element={<RiderSignUp />} />



          {/* Dashboard Routes (Protected) */}
          <Route path="/customer/dashboard" element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customer/stores" element={
            <ProtectedRoute>
              <StoresPage />
            </ProtectedRoute>
          } />
          <Route path="/customer/fresh" element={
            <ProtectedRoute>
              <FreshPage />
            </ProtectedRoute>
          } />
          <Route path="/customer/restaurants" element={
            <ProtectedRoute>
              <RestaurantsPage />
            </ProtectedRoute>
          } />
          <Route path="/customer/concierge" element={
            <ProtectedRoute>
              <ConciergePage />
            </ProtectedRoute>
          } />
          <Route path="/customer/multi-stop-orders" element={
            <ProtectedRoute>
              <MultiStopOrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/merchant/dashboard" element={
            <ProtectedRoute>
              <MerchantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/rider/dashboard" element={
            <ProtectedRoute>
              <RiderDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;



