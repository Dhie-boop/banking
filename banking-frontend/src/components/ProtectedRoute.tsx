import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import authService from '../services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: ('ADMIN' | 'CUSTOMER' | 'TELLER')[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (roles && roles.length > 0 && user) {
    const hasRole = roles.includes(user.role);
    if (!hasRole) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = authService.getRedirectPath();
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
}