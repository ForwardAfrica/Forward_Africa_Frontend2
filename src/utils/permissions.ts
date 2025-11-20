import { Permission, UserRole, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../types';

/**
 * Permission Management Utilities
 * Provides helper functions for role-based access control
 */

/**
 * Check if user has a specific permission
 */
export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('system:full_access');
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
};

/**
 * Check if user has all required permissions
 */
export const hasAllPermissions = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
};

/**
 * Get permissions for a specific role
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a user can manage another role
 */
export const canManageRole = (currentUserRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole];
};

/**
 * Get all roles that a user can manage
 */
export const getManageableRoles = (currentUserRole: UserRole): UserRole[] => {
  return Object.keys(ROLE_HIERARCHY).filter(role =>
    canManageRole(currentUserRole, role as UserRole)
  ) as UserRole[];
};

/**
 * Check if user has system administration permissions
 */
export const isSystemAdmin = (userPermissions: Permission[]): boolean => {
  return hasPermission(userPermissions, 'system:full_access');
};

/**
 * Check if user has content management permissions
 */
export const isContentManager = (userPermissions: Permission[]): boolean => {
  return hasAnyPermission(userPermissions, [
    'content:upload',
    'content:edit',
    'content:delete',
    'courses:create',
    'courses:edit'
  ]);
};

/**
 * Check if user has community management permissions
 */
export const isCommunityManager = (userPermissions: Permission[]): boolean => {
  return hasAnyPermission(userPermissions, [
    'community:moderate',
    'community:ban_users',
    'community:delete_posts'
  ]);
};

/**
 * Check if user has user support permissions
 */
export const isUserSupport = (userPermissions: Permission[]): boolean => {
  return hasAnyPermission(userPermissions, [
    'support:view_tickets',
    'support:respond_tickets'
  ]);
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    'Super Admin': 'Super Admin',
    'Instructor': 'Instructor',
    'Content Manager': 'Content Manager',
    'Community Manager': 'Community Manager',
    'User Support': 'User Support',
    user: 'User'
  };
  return roleNames[role] || role;
};

/**
 * Get role description
 */
export const getRoleDescription = (role: UserRole): string => {
  const roleDescriptions: Record<UserRole, string> = {
    'Super Admin': 'Full system access and configuration. Can manage all users, content, and system settings.',
    'Instructor': 'Course creation and instruction. Can upload content, manage courses, and review student progress.',
    'Content Manager': 'Course upload and editing permissions. Can manage content workflow and instructor accounts.',
    'Community Manager': 'Forum moderation capabilities. Can manage community interactions and user support.',
    'User Support': 'Limited user account assistance. Basic reporting and communication tools.',
    user: 'Standard user with access to courses and basic features.'
  };
  return roleDescriptions[role] || '';
};

/**
 * Get permission display name
 */
export const getPermissionDisplayName = (permission: Permission): string => {
  const permissionNames: Record<Permission, string> = {
    // System Management
    'system:full_access': 'Full System Access',
    'system:configuration': 'System Configuration',
    'system:maintenance': 'System Maintenance',
    'system:backup': 'System Backup',

    // User Management
    'users:view': 'View Users',
    'users:create': 'Create Users',
    'users:edit': 'Edit Users',
    'users:delete': 'Delete Users',
    'users:assign_roles': 'Assign User Roles',
    'users:suspend': 'Suspend Users',
    'users:activate': 'Activate Users',

    // Content Management
    'content:upload': 'Upload Content',
    'content:edit': 'Edit Content',
    'content:delete': 'Delete Content',
    'content:publish': 'Publish Content',
    'content:review': 'Review Content',
    'content:workflow': 'Content Workflow',

    // Course Management
    'courses:view': 'View Courses',
    'courses:create': 'Create Courses',
    'courses:edit': 'Edit Courses',
    'courses:delete': 'Delete Courses',
    'courses:publish': 'Publish Courses',
    'courses:assign_instructors': 'Assign Instructors',

    // Instructor Management
    'instructors:view': 'View Instructors',
    'instructors:create': 'Create Instructors',
    'instructors:edit': 'Edit Instructors',
    'instructors:delete': 'Delete Instructors',
    'instructors:approve': 'Approve Instructors',

    // Community Management
    'community:moderate': 'Moderate Community',
    'community:ban_users': 'Ban Users',
    'community:delete_posts': 'Delete Posts',
    'community:pin_posts': 'Pin Posts',
    'community:analytics': 'Community Analytics',

    // Support Management
    'support:view_tickets': 'View Support Tickets',
    'support:respond_tickets': 'Respond to Tickets',
    'support:escalate_tickets': 'Escalate Tickets',
    'support:close_tickets': 'Close Tickets',

    // Financial & Analytics
    'analytics:view': 'View Analytics',
    'analytics:export': 'Export Analytics',
    'financial:view': 'View Financial Data',
    'financial:export': 'Export Financial Data',
    'financial:refund': 'Process Refunds',

    // Communication
    'communication:send_announcements': 'Send Announcements',
    'communication:send_emails': 'Send Emails',
    'communication:send_notifications': 'Send Notifications',

    // Audit & Security
    'audit:view_logs': 'View Audit Logs',
    'audit:export_logs': 'Export Audit Logs',
    'security:view_sessions': 'View User Sessions',
    'security:terminate_sessions': 'Terminate Sessions'
  };
  return permissionNames[permission] || permission;
};

/**
 * Get permission category
 */
export const getPermissionCategory = (permission: Permission): string => {
  if (permission.startsWith('system:')) return 'System Management';
  if (permission.startsWith('users:')) return 'User Management';
  if (permission.startsWith('content:')) return 'Content Management';
  if (permission.startsWith('courses:')) return 'Course Management';
  if (permission.startsWith('instructors:')) return 'Instructor Management';
  if (permission.startsWith('community:')) return 'Community Management';
  if (permission.startsWith('support:')) return 'Support Management';
  if (permission.startsWith('analytics:') || permission.startsWith('financial:')) return 'Analytics & Financial';
  if (permission.startsWith('communication:')) return 'Communication';
  if (permission.startsWith('audit:') || permission.startsWith('security:')) return 'Audit & Security';
  return 'Other';
};

/**
 * Group permissions by category
 */
export const groupPermissionsByCategory = (permissions: Permission[]): Record<string, Permission[]> => {
  const grouped: Record<string, Permission[]> = {};

  permissions.forEach(permission => {
    const category = getPermissionCategory(permission);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(permission);
  });

  return grouped;
};

/**
 * Validate role permissions
 */
export const validateRolePermissions = (role: UserRole, permissions: Permission[]): boolean => {
  const expectedPermissions = getRolePermissions(role);
  return hasAllPermissions(permissions, expectedPermissions);
};

/**
 * Get missing permissions for a role
 */
export const getMissingPermissions = (role: UserRole, userPermissions: Permission[]): Permission[] => {
  const expectedPermissions = getRolePermissions(role);
  return expectedPermissions.filter(permission => !hasPermission(userPermissions, permission));
};
