import React, { createContext, useContext, useEffect, useState } from 'react';
import { Permission, UserRole, ROLE_PERMISSIONS } from '../types';
import { hasPermission as checkPermission, hasAnyPermission, hasAllPermissions } from '../types';
import { useAuth } from './AuthContext';

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
  const { user } = useFirebaseAuth();
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [permissions, setPermissions] = useState<Permission[]>(ROLE_PERMISSIONS.user);

  useEffect(() => {
    // Get user role from AuthContext user
    const role = (user?.role as UserRole) || 'user';
    setUserRole(role);
    setPermissions(ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user);
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    if (userRole === 'super_admin') return true;
    return checkPermission(permissions, permission);
  };

  const hasAnyPermissionCheck = (requiredPermissions: Permission[]): boolean => {
    if (userRole === 'super_admin') return true;
    return hasAnyPermission(permissions, requiredPermissions);
  };

  const hasAllPermissionsCheck = (requiredPermissions: Permission[]): boolean => {
    if (userRole === 'super_admin') return true;
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
