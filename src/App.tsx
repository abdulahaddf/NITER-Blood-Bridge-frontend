import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { SearchPage } from '@/pages/search/SearchPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ProfileEditPage } from '@/pages/profile/ProfileEditPage';
import { DonorProfilePage } from '@/pages/donor/DonorProfilePage';
import { BloodRequestPage } from '@/pages/request/BloodRequestPage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminDeletionsPage } from '@/pages/admin/AdminDeletionsPage';
import { AdminSeedDataPage } from '@/pages/admin/AdminSeedDataPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminBroadcastPage } from '@/pages/admin/AdminBroadcastPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';

import type { AuthContextType } from '@/hooks/useAuth';

// Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles }: { children: React.ReactNode; requiredRoles?: string[] }) => {
  const auth = useAuthContext();
  
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!auth.isAuthenticated) {
    // Save current location for redirect after login
    localStorage.setItem('auth_redirect_from', window.location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles && !auth.hasRole(requiredRoles as any)) {
    return <Navigate to="/search" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to search if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthContext();
  
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (auth.isAuthenticated) {
    return <Navigate to="/search" replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/verify" element={<VerifyEmailPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<MainLayout />}>
            <Route 
              path="/search" 
              element={<ProtectedRoute><SearchPage /></ProtectedRoute>} 
            />
            <Route 
              path="/profile" 
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
            />
            <Route 
              path="/profile/edit" 
              element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} 
            />
            <Route 
              path="/donor/:id" 
              element={<ProtectedRoute><DonorProfilePage /></ProtectedRoute>} 
            />
            <Route 
              path="/request-blood" 
              element={<ProtectedRoute><BloodRequestPage /></ProtectedRoute>} 
            />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}><AdminDashboardPage /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/users" 
              element={<ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}><AdminUsersPage /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/deletions" 
              element={<ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}><AdminDeletionsPage /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/seed-data" 
              element={<ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}><AdminSeedDataPage /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/analytics" 
              element={<ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}><AdminAnalyticsPage /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/broadcast" 
              element={<ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}><AdminBroadcastPage /></ProtectedRoute>} 
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthContext.Provider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
