import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionContext';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { validateTokenInCookie } from '../../lib/validateToken';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'admin' | 'user';
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole = 'user',
  fallback
}) => {
  const { user, loading: authLoading } = useAuth();
  const { userRole } = usePermissions();
  const [isClient, setIsClient] = useState(false);

  console.log('🛡️ AuthGuard: Render', { user, authLoading, userRole, requiredRole, isClient });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading while authentication is being checked
  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to access this page.</p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/login'}
            className="flex items-center mx-auto"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Check role permissions with improved logic
  const hasRequiredRole = () => {
    console.log('🔍 Role check:', { userRole, requiredRole, user });

    // If no specific role required, allow access
    if (!requiredRole || requiredRole === 'user') {
      return true;
    }

    // Check for super_admin role
    if (requiredRole === 'super_admin') {
      // Accept 'super_admin' role for super_admin access
      return userRole === 'super_admin';
    }

    // Check for admin role (Admin and Super Admin only)
    if (requiredRole === 'admin') {
      return userRole === 'Admin' || userRole === 'Super Admin';
    }

    return true; // Default to allowing access
  };

  if (!hasRequiredRole()) {
    console.log('❌ Access denied:', { userRole, requiredRole });
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
          <p className="text-gray-500 text-sm mb-4">Required: {requiredRole}, Your role: {userRole}</p>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/admin'}
            className="flex items-center mx-auto"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  console.log('✅ Access granted for role:', requiredRole);
  return <>{children}</>;
};

export default AuthGuard;
