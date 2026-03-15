import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: 'guest' | 'supervisor';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { userRole } = useAuth();

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Redirect to appropriate page based on role
    const redirectPath = userRole === 'supervisor' ? '/admin' : '/activities';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
