import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FleetPage } from '@/pages/FleetPage';
import { LoginPage } from '@/pages/LoginPage';
import { VehiclePage } from '@/pages/VehiclePage';
import { AlertsPage } from '@/pages/AlertsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { ModelsPage } from '@/pages/ModelsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { Toaster } from '@/components/ui/toaster';
import { RouteDebug } from '@/components/RouteDebug';
import { TestPage } from './TestPage';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/auth';

// Lazy load MapPage to avoid react-leaflet context issues on initial load
const MapPage = lazy(() => import('@/pages/MapPage').then(module => ({ default: module.MapPage })));

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/fleet" replace /> : <LoginPage />} />
      <Route 
        path="/test" 
        element={
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/fleet" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/fleet" 
        element={
          <ProtectedRoute>
            <FleetPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/map" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><Skeleton className="h-64 w-full" /></div>}>
              <MapPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vehicles/:vehicleId" 
        element={
          <ProtectedRoute>
            <VehiclePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/alerts" 
        element={
          <ProtectedRoute>
            <AlertsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/models" 
        element={
          <ProtectedRoute>
            <ModelsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/fleet" : "/login"} replace />} />
    </Routes>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <AppRoutes />
        <Toaster />
      </>
    );
  }

  return (
    <AppLayout>
      <AppRoutes />
      <Toaster />
      <RouteDebug />
    </AppLayout>
  );
}

function App() {
  console.log('App component rendering');
  
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

