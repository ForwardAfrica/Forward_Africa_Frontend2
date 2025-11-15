import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, ROLE_HIERARCHY } from '../../types';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireOnboarding?: boolean;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
  requiredRole,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  console.log("ProtectedRoute Check:", {
    isLoading: loading,
    user: user,
    requiredRole: requiredRole,
    pathname: location.pathname
  });

  if (!user) {
    // If not logged in, redirect to login page
    const redirectTo = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check for required role
  if (requiredRole) {
    const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="bg-red-500/20 p-3 rounded-full inline-flex mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400">
                You don&apos;t have sufficient permissions to access this page.
                Required role: {requiredRole}
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                variant="primary"
                onClick={() => {
                  // Navigate to admin login - will be handled by context
                }}
              >
                Return to Login
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Onboarding check for regular users - Progressive profiling approach
  // Users can access the app but will be prompted to complete profile later
  if (requireOnboarding && user && !user.onboarding_completed && !requiredRole) {
    // Instead of redirecting, we'll allow access but track that onboarding is incomplete
    // This enables progressive profiling - users can use the app but will be prompted later
    console.log("User has incomplete onboarding - progressive profiling enabled");
  }

  return <>{children || <Outlet />}</>;
};

export default ProtectedRoute;
