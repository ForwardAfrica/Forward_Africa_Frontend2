# Role-Based Access Control (RBAC) Standardization Guide

## Problem Summary

Your Super Admin loses access to the Admin Panel because of **inconsistent role representation** throughout your system:

- **JWT tokens store**: `'Super Admin'` (exact format with spaces)
- **Some frontend components use**: `'super_admin'` (snake_case with lowercase)  
- **Permission matrix expects**: Exact JWT format as keys

When a role doesn't match the permission matrix keys, the system defaults to user permissions, causing access denial.

---

## Root Cause Analysis

### 1. **JWT Token Format vs. Frontend Usage**

**JWT Token (Correct):**
```typescript
// pages/api/auth/login.ts - Line 242
role: userRole  // e.g., "Super Admin" from Firestore
```

**Frontend Normalization Issues Found:**
- `src/pages/ManageUsersPage.tsx`: Uses `'super_admin'`, `'content_manager'`
- `src/pages/AdminLoginPage.tsx`: Expects `'super_admin'` 
- `src/pages/CreateAdminUserPage.tsx`: Sets `role: 'content_manager'`
- `src/pages/SecuritySettingsPage.tsx`: Defines roles with snake_case keys
- HTML select options: Store values as `'super_admin'`, `'content_manager'`, etc.

### 2. **PermissionContext Lookup Failure**

```typescript
// OLD CODE: src/contexts/PermissionContext.tsx
const userRole = (user?.role as UserRole) || 'user';
setPermissions(ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.user);
```

When `user.role = "super_admin"`:
- Lookup: `ROLE_PERMISSIONS["super_admin"]` → **undefined**
- Fallback: `ROLE_PERMISSIONS.user` → Basic user permissions only
- Result: Super Admin loses all elevated permissions ❌

### 3. **AuthGuard Type Inconsistency**

```typescript
// OLD CODE: src/components/ui/AuthGuard.tsx
requiredRole?: 'Super Admin' | 'admin' | 'user';
```

- Accepts `'admin'` but permission checks only recognize exact roles
- `pages/admin/audit-logs.tsx` uses `requiredRole="super_admin"` which doesn't match type definition

---

## Solution Implemented

### **1. Role Standardization Utility** (`src/lib/roleStandardization.ts`)

Centralized utility that handles all role format variations:

```typescript
const ROLE_NORMALIZATION_MAP = {
  'super_admin': 'Super Admin',
  'SUPER_ADMIN': 'Super Admin',
  'admin': 'Super Admin',
  'content_manager': 'Content Manager',
  'community_manager': 'Community Manager',
  'user_support': 'User Support',
  // ... more variations
};

export const standardizeRole = (role: string | undefined | null): UserRole => {
  // Returns exact JWT format: 'Super Admin', 'Instructor', etc.
};

export const isAdminRole = (role: string | UserRole | undefined | null): boolean => {
  // Returns true for admin roles
};

export const isSuperAdminRole = (role: string | UserRole | undefined | null): boolean => {
  // Returns true only for Super Admin
};

export const hasRequiredRole = (userRole: string | UserRole | undefined | null, requiredRole: string): boolean => {
  // Validates user role against required role
};
```

### **2. PermissionContext Fix**

**Before:**
```typescript
const userRole = (user?.role as UserRole) || 'user';
setPermissions(ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.user);
```

**After:**
```typescript
import { standardizeRole } from '../lib/roleStandardization';

const standardized = standardizeRole(user?.role);
setUserRole(standardized);
const rolePermissions = ROLE_PERMISSIONS[standardized];
```

**Result**: Roles are now always standardized before permission lookup ✅

### **3. AuthContext Fix**

**Before:**
```typescript
isAdmin: user?.role === 'Super Admin' || user?.role === 'Content Manager' || user?.role === 'Instructor',
isSuperAdmin: user?.role === 'Super Admin',
```

**After:**
```typescript
isAdmin: user ? ['Super Admin', 'Content Manager', 'Instructor'].includes(standardizeRole(user.role)) : false,
isSuperAdmin: user ? standardizeRole(user.role) === 'Super Admin' : false,
```

**Result**: Role checks handle legacy formats gracefully ✅

### **4. AuthGuard Component Fix**

**Before:**
```typescript
requiredRole?: 'Super Admin' | 'admin' | 'user';
// ... manual role comparison logic
if (requiredRole === 'admin') {
  return userRole === 'Super Admin' || userRole === 'Content Manager' || userRole === 'Instructor';
}
```

**After:**
```typescript
import { hasRequiredRole } from '../../lib/roleStandardization';

requiredRole?: UserRole | 'admin';

const hasRequiredRoleCheck = () => {
  if (!requiredRole || requiredRole === 'user') return true;
  return hasRequiredRole(userRole, requiredRole);
};
```

**Result**: Centralized role comparison logic, supports both 'Super Admin' and 'admin' ✅

### **5. Component-Specific Fixes**

#### ManageUsersPage
- Updated UserData interface to use `UserRole` type
- Fixed role selection to use standardized format
- Added standardization in permission checks
- Fixed role display (removed `.replace('_', ' ')` transformation)

#### CreateAdminUserPage
- Updated AdminUser interface to use `UserRole` type
- Changed default role from `'content_manager'` to `'Content Manager'`
- Fixed role validation to use standardized format
- Updated select options to standardized roles

#### AdminLoginPage
- Updated example account role references to standardized format
- getRoleIcon function already uses correct format (no changes needed)

#### SecuritySettingsPage
- Changed `permissionsConfig` keys from snake_case to standardized format
- Fixed role comparisons in handleRolePermissionChange
- Updated UI role icon checks to use standardized format
- Removed `.replace('_', ' ')` transformations since roles are properly formatted

#### audit-logs.tsx
- Changed `requiredRole="super_admin"` to `requiredRole="Super Admin"`

---

## Canonical Role Format

All roles should now use this exact format throughout the system:

| Role | Usage |
|------|-------|
| `'Super Admin'` | Administrator with full system access |
| `'Instructor'` | Teacher/Course creator |
| `'Content Manager'` | Content management permissions |
| `'Community Manager'` | Community moderation |
| `'User Support'` | Customer support staff |
| `'user'` | Regular user (lowercase) |

---

## Role Permission Matrix (`src/types/index.ts`)

The ROLE_PERMISSIONS object uses these canonical keys:

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'Super Admin': [ /* full access */ ],
  'Instructor': [ /* teaching permissions */ ],
  'Content Manager': [ /* content permissions */ ],
  'Community Manager': [ /* moderation permissions */ ],
  'User Support': [ /* support permissions */ ],
  user: [ /* basic permissions */ ]
};
```

---

## Key Principles

1. **Single Source of Truth**: JWT tokens always contain the exact role format
2. **Standardization on Read**: All role values are standardized when used
3. **Backward Compatibility**: `standardizeRole()` handles legacy formats
4. **Type Safety**: TypeScript enforces correct role types
5. **Centralized Logic**: Use utility functions instead of inline comparisons

---

## Migration Checklist

✅ Created `src/lib/roleStandardization.ts`  
✅ Updated `src/contexts/PermissionContext.tsx`  
✅ Updated `src/contexts/AuthContext.tsx`  
✅ Fixed `src/components/ui/AuthGuard.tsx`  
✅ Fixed `pages/admin/audit-logs.tsx`  
✅ Fixed `src/pages/ManageUsersPage.tsx`  
✅ Fixed `src/pages/CreateAdminUserPage.tsx`  
✅ Fixed `src/pages/AdminLoginPage.tsx`  
✅ Fixed `src/pages/SecuritySettingsPage.tsx`  

---

## Testing the Fix

### Test Case 1: Super Admin Login
1. Log in with a Super Admin account
2. Verify JWT token contains `"role":"Super Admin"`
3. Verify access to `/admin` dashboard ✓
4. Verify `usePermissions().userRole === 'Super Admin'` ✓

### Test Case 2: Content Manager Login
1. Log in with a Content Manager account
2. Verify content management permissions are active ✓
3. Verify no system admin permissions ✓

### Test Case 3: Legacy Role Handling
1. If any user has role stored as `'super_admin'` (legacy format)
2. Verify `standardizeRole('super_admin') === 'Super Admin'` ✓
3. Verify permissions are correctly mapped ✓

---

## Important Files Modified

| File | Change |
|------|--------|
| `src/lib/roleStandardization.ts` | **NEW** - Centralized role standardization |
| `src/contexts/PermissionContext.tsx` | Added role standardization |
| `src/contexts/AuthContext.tsx` | Added role standardization in auth checks |
| `src/components/ui/AuthGuard.tsx` | Use standardized role comparison |
| `pages/admin/audit-logs.tsx` | Fixed requiredRole format |
| `src/pages/ManageUsersPage.tsx` | Fixed role storage and display |
| `src/pages/CreateAdminUserPage.tsx` | Fixed role defaults and validation |
| `src/pages/AdminLoginPage.tsx` | Fixed role references |
| `src/pages/SecuritySettingsPage.tsx` | Fixed role permission config |
| `src/types/index.ts` | Already correct (no changes) |

---

## Future Prevention

To prevent role normalization issues in the future:

1. **Always use the `standardizeRole()` utility** when:
   - Reading roles from user objects
   - Comparing roles in conditions
   - Using roles as object keys

2. **Never normalize roles manually** - Don't use:
   - `.toLowerCase()` on roles
   - `.replace()` transformations
   - Custom role mappings

3. **Use TypeScript types** - Import `UserRole` type and use it consistently

4. **Code Review Checklist**:
   - [ ] No snake_case role comparisons (e.g., `'super_admin'`)
   - [ ] All role comparisons use `standardizeRole()`
   - [ ] Role select options use canonical format
   - [ ] No string manipulations on role values

---

## Support

If Super Admin still loses access after applying these fixes:

1. Check browser console for role standardization logs
2. Verify JWT token contains correct role format
3. Check PermissionContext logs for permission lookup
4. Verify Firestore user document has correct role

All debug logs are prefixed with 🔐, 🔍, or ⚠️ for easy filtering.
