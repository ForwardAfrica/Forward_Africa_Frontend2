import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, Mail, Activity, Plus, Shield, Ban, CheckCircle, Eye, Settings, Loader2, X, Calendar, BookOpen, Award } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import { usePermissions } from '../contexts/PermissionContext';
import PermissionGuard from '../components/ui/PermissionGuard';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useUsers } from '../hooks/useDatabase';
import Image from 'next/image';
import Layout from '../components/layout/Layout';
import { standardizeRole } from '../lib/roleStandardization';
import { UserRole } from '../types';

interface UserData {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  role: UserRole;
  joinDate: string;
  lastActive: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  avatar?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

const ManageUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'Content Manager' | 'Community Manager' | 'User Support' | 'Super Admin'>('all');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // Database hooks
  const {
    users: dbUsers,
    loading: usersLoading,
    error: usersError,
    fetchAllUsers,
    updateUser
  } = useUsers();

  // Check if user has permission to manage users
  const canManageUsers = hasPermission('users:view');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Clear permission error after 5 seconds
  useEffect(() => {
    if (permissionError) {
      const timer = setTimeout(() => {
        setPermissionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [permissionError]);

  // Fetch users from database on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Helper function to safely format dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'Unknown';

    const parsed = Date.parse(dateValue);
    if (isNaN(parsed)) return 'Unknown';

    try {
      return new Date(dateValue).toISOString().split('T')[0];
    } catch (error) {
      return 'Unknown';
    }
  };

  // Convert database users to UserData format when dbUsers changes
  useEffect(() => {
    if (dbUsers && dbUsers.length > 0) {
      const convertedUsers: UserData[] = dbUsers.map(dbUser => ({
        id: dbUser.id,
        name: dbUser.full_name || dbUser.displayName || dbUser.fullName || dbUser.email || 'Unknown User',
        email: dbUser.email,
        status: 'active', // Default to active since we don't have status field in DB
        role: dbUser.role || 'user',
        joinDate: formatDate(dbUser.created_at),
        lastActive: formatDate(dbUser.updated_at),
        coursesEnrolled: 0, // Will be calculated from user_progress table later
        coursesCompleted: 0, // Will be calculated from user_progress table later
        avatar: dbUser.avatar_url || dbUser.photoURL || dbUser.avatarUrl
      }));
      setUsers(convertedUsers);
    } else {
      setUsers([]);
    }
  }, [dbUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    // Standardize both the user role and filter for comparison (handle legacy snake_case)
    const standardizedUserRole = standardizeRole(user.role);
    const standardizedFilter = roleFilter === 'all' ? 'all' : standardizeRole(roleFilter);
    const matchesRole = standardizedFilter === 'all' || standardizedUserRole === standardizedFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Initialize permissions for a user
  const initializeUserPermissions = (user: UserData) => {
    // Standardize role for permission checks
    const standardizedRole = standardizeRole(user.role);
    const isSuperAdmin = standardizedRole === 'Super Admin';
    const isContentManager = standardizedRole === 'Content Manager';
    const isCommunityManager = standardizedRole === 'Community Manager';

    const allPermissions: Permission[] = [
      // User Management
      { id: 'users:view', name: 'View Users', description: 'Can view user list and details', category: 'User Management', enabled: isSuperAdmin || isContentManager },
      { id: 'users:create', name: 'Create Users', description: 'Can create new admin users', category: 'User Management', enabled: isSuperAdmin },
      { id: 'users:edit', name: 'Edit Users', description: 'Can edit user information', category: 'User Management', enabled: isSuperAdmin || isContentManager },
      { id: 'users:delete', name: 'Delete Users', description: 'Can delete user accounts', category: 'User Management', enabled: isSuperAdmin },
      { id: 'users:suspend', name: 'Suspend Users', description: 'Can suspend user accounts', category: 'User Management', enabled: isSuperAdmin || isContentManager },

      // Content Management
      { id: 'content:view', name: 'View Content', description: 'Can view all course content', category: 'Content Management', enabled: true },
      { id: 'content:create', name: 'Create Content', description: 'Can create new courses and lessons', category: 'Content Management', enabled: isSuperAdmin || isContentManager },
      { id: 'content:edit', name: 'Edit Content', description: 'Can edit existing content', category: 'Content Management', enabled: isSuperAdmin || isContentManager },
      { id: 'content:delete', name: 'Delete Content', description: 'Can delete content', category: 'Content Management', enabled: isSuperAdmin },
      { id: 'content:publish', name: 'Publish Content', description: 'Can publish content to live', category: 'Content Management', enabled: isSuperAdmin || isContentManager },

      // Community Management
      { id: 'community:view', name: 'View Community', description: 'Can view community features', category: 'Community Management', enabled: true },
      { id: 'community:moderate', name: 'Moderate Community', description: 'Can moderate community discussions', category: 'Community Management', enabled: isSuperAdmin || isCommunityManager },
      { id: 'community:ban', name: 'Ban Users', description: 'Can ban users from community', category: 'Community Management', enabled: isSuperAdmin || isCommunityManager },

      // Analytics & Reports
      { id: 'analytics:view', name: 'View Analytics', description: 'Can view platform analytics', category: 'Analytics', enabled: isSuperAdmin || isContentManager },
      { id: 'reports:generate', name: 'Generate Reports', description: 'Can generate system reports', category: 'Analytics', enabled: isSuperAdmin },

      // System Settings
      { id: 'settings:view', name: 'View Settings', description: 'Can view system settings', category: 'System Settings', enabled: isSuperAdmin },
      { id: 'settings:edit', name: 'Edit Settings', description: 'Can modify system settings', category: 'System Settings', enabled: isSuperAdmin },
    ];

    setUserPermissions(allPermissions);
  };

  const handleUserAction = (userId: string, action: 'view' | 'suspend' | 'activate' | 'delete' | 'permissions' | 'password' | 'role') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check permissions for actions
    if (action === 'delete' && !hasPermission('users:delete')) {
      setPermissionError('You do not have permission to delete users. This action requires Admin or Super Admin privileges.');
      return;
    }

    if ((action === 'suspend' || action === 'activate') && !hasPermission('users:suspend')) {
      setPermissionError('You do not have permission to change user status. This action requires Admin or Super Admin privileges.');
      return;
    }

    if ((action === 'password' || action === 'role') && !hasPermission('users:suspend')) {
      setPermissionError('You do not have permission to modify user accounts. This action requires Admin or Super Admin privileges.');
      return;
    }

    switch (action) {
      case 'view':
        setSelectedUser(user);
        setShowUserModal(true);
        break;
      case 'suspend':
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'suspended' as const } : u
        ));
        // Update in database
        updateUser(userId, { suspended: true });
        break;
      case 'activate':
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: 'active' as const } : u
        ));
        // Update in database
        updateUser(userId, { suspended: false });
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          setUsers(prev => prev.filter(u => u.id !== userId));
          // TODO: Implement delete in database
        }
        break;
      case 'permissions':
        setSelectedUser(user);
        initializeUserPermissions(user);
        setShowPermissionsModal(true);
        break;
      case 'password':
        setSelectedUser(user);
        setNewPassword('');
        setPasswordError(null);
        setShowPasswordModal(true);
        break;
      case 'role':
        setSelectedUser(user);
        setSelectedRole(user.role);
        setShowRoleModal(true);
        break;
    }
  };

  const handlePermissionChange = (permissionId: string, enabled: boolean) => {
    setUserPermissions(prev => prev.map(p =>
      p.id === permissionId ? { ...p, enabled } : p
    ));
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      // Update user role based on permissions
      const hasAdminPermissions = userPermissions.some(p =>
        ['users:create', 'users:delete', 'settings:edit'].includes(p.id) && p.enabled
      );

      const hasContentManagerPermissions = userPermissions.some(p =>
        ['content:create', 'content:edit', 'content:publish'].includes(p.id) && p.enabled
      );

      const hasCommunityManagerPermissions = userPermissions.some(p =>
        ['community:moderate', 'community:ban'].includes(p.id) && p.enabled
      );

      let newRole: UserRole = 'user';
      if (hasAdminPermissions) {
        newRole = 'Super Admin';
      } else if (hasContentManagerPermissions) {
        newRole = 'Content Manager';
      } else if (hasCommunityManagerPermissions) {
        newRole = 'Community Manager';
      }

      // Update user in database with standardized role
      await updateUser(selectedUser.id, { role: newRole });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, role: newRole as any } : u
      ));

      setShowPermissionsModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user permissions:', error);
      setPermissionError('Failed to update user permissions. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) {
      setPasswordError('Password is required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordChangeLoading(true);
    setPasswordError(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      // Success - close modal and refresh users
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
      await fetch('/api/users/list').then(r => r.json()); // Refresh user list
    } catch (error: any) {
      console.error('Failed to change password:', error);
      setPasswordError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;

    setRoleChangeLoading(true);

    try {
      await updateUser(selectedUser.id, { role: selectedRole });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, role: selectedRole } : u
      ));

      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to change user role:', error);
      setPermissionError('Failed to change user role. Please try again.');
    } finally {
      setRoleChangeLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-500',
      suspended: 'bg-red-500/20 text-red-500',
      pending: 'bg-yellow-500/20 text-yellow-500'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      user: 'bg-gray-500/20 text-gray-400',
      'Instructor': 'bg-green-500/20 text-green-400',
      'Content Manager': 'bg-green-500/20 text-green-400',
      'Community Manager': 'bg-blue-500/20 text-blue-400',
      'User Support': 'bg-yellow-500/20 text-yellow-400',
      'Super Admin': 'bg-purple-500/20 text-purple-400'
    };
    return styles[role as keyof typeof styles] || styles.user;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'Instructor': return <Shield className="h-4 w-4 text-green-500" />;
      case 'Content Manager': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'Community Manager': return <User className="h-4 w-4 text-green-500" />;
      case 'User Support': return <User className="h-4 w-4 text-yellow-500" />;
      default: return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  // Redirect if user doesn't have permission
  if (!canManageUsers) {
    return (
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You do not have permission to manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Permission Error Message */}
          {permissionError && (
            <div className="mb-6">
              <ErrorMessage
                title="Permission Denied"
                message={permissionError}
                onClose={() => setPermissionError(null)}
              />
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <p className="text-gray-400 mt-2">Manage user accounts, roles, and permissions</p>
              </div>
            </div>

            <PermissionGuard permission="users:create">
              <Button
                variant="primary"
                onClick={() => navigate('/admin/create-user')}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Admin User
              </Button>
            </PermissionGuard>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="Content Manager">Content Manager</option>
                  <option value="Community Manager">Community Manager</option>
                  <option value="User Support">User Support</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Courses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                          <span className="text-gray-400">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-center">
                          <div className="text-red-500 mb-2">Failed to load users</div>
                          <div className="text-gray-400 text-sm mb-4">{usersError}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchAllUsers()}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-center">
                          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="text-gray-400 mb-2">No users found</div>
                          <div className="text-gray-500 text-sm">
                            {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'No users have been registered yet'
                            }
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                              {user.avatar ? (
                                user.avatar.startsWith('http') ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (target.src !== '/images/placeholder-avatar.jpg') {
                                        target.src = '/images/placeholder-avatar.jpg';
                                      }
                                    }}
                                  />
                                ) : (
                                  <Image
                                    src={user.avatar}
                                    alt={user.name}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (target.src !== '/images/placeholder-avatar.jpg') {
                                        target.src = '/images/placeholder-avatar.jpg';
                                      }
                                    }}
                                  />
                                )
                              ) : (
                                <User className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-gray-400 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center space-x-4">
                            <span>{user.coursesCompleted}/{user.coursesEnrolled}</span>
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{
                                  width: `${user.coursesEnrolled > 0 ? (user.coursesCompleted / user.coursesEnrolled) * 100 : 0}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-gray-400" />
                            {user.lastActive === 'Unknown' ? 'Unknown' : new Date(user.lastActive).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-1 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'view')}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'password')}
                              className="text-orange-500 border-orange-500 hover:bg-orange-500/10"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Password
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'role')}
                              className="text-blue-500 border-blue-500 hover:bg-blue-500/10"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Role
                            </Button>

                            {user.status === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="text-red-500 border-red-500 hover:bg-red-500/10"
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'activate')}
                                className="text-green-500 border-green-500 hover:bg-green-500/10"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-green-500/10 p-3 rounded-lg mr-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.filter(u => u.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-red-500/10 p-3 rounded-lg mr-4">
                  <Ban className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.filter(u => u.status === 'suspended').length}
                  </div>
                  <div className="text-sm text-gray-400">Suspended</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-blue-500/10 p-3 rounded-lg mr-4">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.filter(u => u.role === 'Content Manager' || u.role === 'Super Admin').length}
                  </div>
                  <div className="text-sm text-gray-400">Admins</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500/10 p-3 rounded-lg mr-4">
                  <User className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {users.filter(u => {
                      if (u.joinDate === 'Unknown') return false;
                      const joinDate = new Date(u.joinDate);
                      if (isNaN(joinDate.getTime())) return false;
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return joinDate > thirtyDaysAgo;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-400">New (30 days)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">User Details</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                    {selectedUser.avatar ? (
                      selectedUser.avatar.startsWith('http') ? (
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="h-16 w-16 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/images/placeholder-avatar.jpg') {
                              target.src = '/images/placeholder-avatar.jpg';
                            }
                          }}
                        />
                      ) : (
                        <Image
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/images/placeholder-avatar.jpg') {
                              target.src = '/images/placeholder-avatar.jpg';
                            }
                          }}
                        />
                      )
                    ) : (
                      <User className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
                    <p className="text-gray-400">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getRoleIcon(selectedUser.role)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedUser.status)}`}>
                        {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-400">Joined</span>
                    </div>
                    <p className="text-white font-medium">{selectedUser.joinDate === 'Unknown' ? 'Unknown' : new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-400">Last Active</span>
                    </div>
                    <p className="text-white font-medium">{selectedUser.lastActive === 'Unknown' ? 'Unknown' : new Date(selectedUser.lastActive).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-400">Courses Enrolled</span>
                    </div>
                    <p className="text-white font-medium">{selectedUser.coursesEnrolled}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-400">Courses Completed</span>
                    </div>
                    <p className="text-white font-medium">{selectedUser.coursesCompleted}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUserModal(false);
                      handleUserAction(selectedUser.id, 'permissions');
                    }}
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                  {selectedUser.status === 'active' ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUserModal(false);
                        handleUserAction(selectedUser.id, 'suspend');
                      }}
                      className="text-red-500 border-red-500 hover:bg-red-500/10"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend User
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowUserModal(false);
                        handleUserAction(selectedUser.id, 'activate');
                      }}
                      className="text-green-500 border-green-500 hover:bg-green-500/10"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate User
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Manage Permissions</h2>
                  <p className="text-gray-400">Configure permissions for {selectedUser.name}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowPermissionsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Permission Categories */}
                {['User Management', 'Content Management', 'Community Management', 'Analytics', 'System Settings'].map(category => (
                  <div key={category} className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">{category}</h3>
                    <div className="space-y-3">
                      {userPermissions
                        .filter(p => p.category === category)
                        .map(permission => (
                          <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={permission.id}
                                  checked={permission.enabled}
                                  onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                  className="rounded border-gray-500 text-red-500 focus:ring-red-500 bg-gray-700"
                                />
                                <label htmlFor={permission.id} className="text-white font-medium">
                                  {permission.name}
                                </label>
                              </div>
                              <p className="text-gray-400 text-sm mt-1">{permission.description}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setShowPermissionsModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSavePermissions}
                    className="flex-1"
                  >
                    Save Permissions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Change Password</h2>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setPasswordError(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 mb-4">Change password for <span className="text-white font-semibold">{selectedUser.name}</span></p>

                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    placeholder="Enter new password (minimum 6 characters)"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />

                  {passwordError && (
                    <div className="mt-2 text-sm text-red-400">{passwordError}</div>
                  )}

                  <div className="mt-2 text-sm text-gray-400">
                    Password must be at least 6 characters long
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setNewPassword('');
                      setPasswordError(null);
                    }}
                    className="flex-1"
                    disabled={passwordChangeLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleChangePassword}
                    className="flex-1"
                    disabled={passwordChangeLoading || !newPassword}
                  >
                    {passwordChangeLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Change User Role</h2>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedRole('user');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 mb-4">Change role for <span className="text-white font-semibold">{selectedUser.name}</span></p>

                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Select Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="user">User</option>
                    <option value="Content Manager">Content Manager</option>
                    <option value="Community Manager">Community Manager</option>
                    <option value="User Support">User Support</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>

                  <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">Current role:</span> {selectedUser.role}
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      <span className="font-semibold">New role:</span> {selectedRole}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRoleModal(false);
                      setSelectedRole('user');
                    }}
                    className="flex-1"
                    disabled={roleChangeLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleChangeRole}
                    className="flex-1"
                    disabled={roleChangeLoading || selectedRole === selectedUser.role}
                  >
                    {roleChangeLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Role'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageUsersPage;
