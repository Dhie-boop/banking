import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/auth';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TellerDashboard = lazy(() => import('./pages/TellerDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
  </div>
);

function App() {
  const isAuthenticated = authService.isAuthenticated();

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    return authService.getRedirectPath();
  };

  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to={authService.getRedirectPath()} replace />
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? (
                  <Navigate to={authService.getRedirectPath()} replace />
                ) : (
                  <Register />
                )
              } 
            />

            {/* Protected routes for Customers */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute roles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected routes for Admins */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Protected routes for Tellers */}
            <Route 
              path="/teller/*" 
              element={
                <ProtectedRoute roles={['TELLER']}>
                  <TellerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Shared protected routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />

            {/* Root redirect */}
            <Route 
              path="/" 
              element={<Navigate to={getDefaultRoute()} replace />} 
            />

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Toast notifications */}
        <Toast />
      </div>
    </Router>
  );
}

export default App;
