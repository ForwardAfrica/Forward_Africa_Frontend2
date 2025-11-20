import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, userRole } = usePermissions();

  // Super admin has access to everything
  if (userRole === 'Super Admin') {
    return <>{children}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission as any);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions as any[]);
    } else {
      hasAccess = hasAnyPermission(permissions as any[]);
    }
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
