import React, { createContext, useContext, useEffect, useState } from 'react';
import { Permission, UserRole, ROLE_PERMISSIONS } from '../types';
import { hasPermission as checkPermission, hasAnyPermission, hasAllPermissions } from '../types';
import { useAuth } from './AuthContext';
import { standardizeRole } from '../lib/roleStandardization';

interface PermissionContextType {
  userRole: UserRole;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  checkPermission: (permission: Permission) => { hasAccess: boolean; errorMessage: string };
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [permissions, setPermissions] = useState<Permission[]>(ROLE_PERMISSIONS.user);

  useEffect(() => {
    // Standardize role to ensure it's in the exact JWT format
    // This handles cases where role might be stored as 'super_admin', 'content_manager', etc.
    const standardized = standardizeRole(user?.role);

    console.log('🔐 PermissionContext: Setting role from user.role', {
      original: user?.role,
      standardized,
      userExists: !!user
    });

    setUserRole(standardized);

    // Always derive permissions from the standardized role
    // Never rely on the permissions array from the JWT
    const rolePermissions = ROLE_PERMISSIONS[standardized];
    if (!rolePermissions) {
      console.warn(`⚠️ PermissionContext: No permissions found for role "${standardized}", defaulting to user permissions`);
      setPermissions(ROLE_PERMISSIONS.user);
    } else {
      console.log(`✅ PermissionContext: Permissions loaded for role "${standardized}"`, rolePermissions);
      setPermissions(rolePermissions);
    }
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    if (userRole === 'Super Admin') return true;
    return checkPermission(permissions, permission);
  };

  const hasAnyPermissionCheck = (requiredPermissions: Permission[]): boolean => {
    if (userRole === 'Super Admin') return true;
    return hasAnyPermission(permissions, requiredPermissions);
  };

  const hasAllPermissionsCheck = (requiredPermissions: Permission[]): boolean => {
    if (userRole === 'Super Admin') return true;
    return hasAllPermissions(permissions, requiredPermissions);
  };

  const checkPermissionWithError = (permission: Permission) => {
    const hasAccess = hasPermission(permission);
    const errorMessage = hasAccess ? '' : `You don't have permission to access this feature`;

    return { hasAccess, errorMessage };
  };

  return (
    <PermissionContext.Provider value={{
      userRole,
      permissions,
      hasPermission,
      hasAnyPermission: hasAnyPermissionCheck,
      hasAllPermissions: hasAllPermissionsCheck,
      checkPermission: checkPermissionWithError
    }}>
      {children}
    </PermissionContext.Provider>
  );
};
