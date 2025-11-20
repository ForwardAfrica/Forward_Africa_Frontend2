/**
 * Role Standardization Utility
 * Ensures all roles are in the exact format expected by the JWT and permission system
 * 
 * Canonical role format (from JWT tokens):
 * - 'Super Admin'
 * - 'Instructor'
 * - 'Content Manager'
 * - 'Community Manager'
 * - 'User Support'
 * - 'user'
 */

import { UserRole } from '../types';

/**
 * Map of all possible role variations to their canonical form
 */
const ROLE_NORMALIZATION_MAP: Record<string, UserRole> = {
  // Super Admin variations
  'super_admin': 'Super Admin',
  'SUPER_ADMIN': 'Super Admin',
  'Super Admin': 'Super Admin',
  'superadmin': 'Super Admin',
  'admin': 'Super Admin', // 'admin' in AuthGuard should map to 'Super Admin'
  
  // Instructor variations
  'instructor': 'Instructor',
  'Instructor': 'Instructor',
  'INSTRUCTOR': 'Instructor',
  
  // Content Manager variations
  'content_manager': 'Content Manager',
  'Content Manager': 'Content Manager',
  'ContentManager': 'Content Manager',
  'CONTENT_MANAGER': 'Content Manager',
  'content-manager': 'Content Manager',
  
  // Community Manager variations
  'community_manager': 'Community Manager',
  'Community Manager': 'Community Manager',
  'CommunityManager': 'Community Manager',
  'COMMUNITY_MANAGER': 'Community Manager',
  'community-manager': 'Community Manager',
  
  // User Support variations
  'user_support': 'User Support',
  'User Support': 'User Support',
  'UserSupport': 'User Support',
  'USER_SUPPORT': 'User Support',
  'user-support': 'User Support',
  
  // Regular user variations
  'user': 'user',
  'User': 'user',
  'USER': 'user'
};

/**
 * Standardize a role string to the canonical JWT format
 * @param role - Any variation of a role string
 * @returns Standardized role in JWT format, or 'user' if unrecognized
 */
export const standardizeRole = (role: string | undefined | null): UserRole => {
  if (!role || typeof role !== 'string') {
    return 'user';
  }
  
  const trimmedRole = role.trim();
  const standardized = ROLE_NORMALIZATION_MAP[trimmedRole];
  
  if (standardized) {
    return standardized;
  }
  
  // If role doesn't match any variation, return as-is if it's a valid UserRole
  const validRoles: UserRole[] = ['Super Admin', 'Instructor', 'Content Manager', 'Community Manager', 'User Support', 'user'];
  if (validRoles.includes(trimmedRole as UserRole)) {
    return trimmedRole as UserRole;
  }
  
  // Default to user if unrecognized
  console.warn(`Unknown role: "${role}", defaulting to "user"`);
  return 'user';
};

/**
 * Check if a user has admin privileges
 * Admin roles: Super Admin, Content Manager, Instructor
 */
export const isAdminRole = (role: string | UserRole | undefined | null): boolean => {
  const standardized = standardizeRole(role as string);
  return ['Super Admin', 'Content Manager', 'Instructor'].includes(standardized);
};

/**
 * Check if a user is a Super Admin
 */
export const isSuperAdminRole = (role: string | UserRole | undefined | null): boolean => {
  const standardized = standardizeRole(role as string);
  return standardized === 'Super Admin';
};

/**
 * Check if a role matches a required role (supporting both 'Super Admin' and 'admin' notation)
 */
export const hasRequiredRole = (userRole: string | UserRole | undefined | null, requiredRole: string): boolean => {
  const standardized = standardizeRole(userRole as string);
  const standardizedRequired = standardizeRole(requiredRole);
  
  if (standardizedRequired === 'Super Admin') {
    return standardized === 'Super Admin';
  }
  
  // 'admin' in AuthGuard should mean any admin role
  if (requiredRole === 'admin') {
    return isAdminRole(standardized);
  }
  
  return standardized === standardizedRequired;
};
