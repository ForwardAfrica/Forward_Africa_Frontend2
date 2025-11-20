import React, { useState, useEffect } from 'react';
import { User, Shield, Edit, Trash2, Plus, X, Check, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../../types';
import { hasPermission, canManageRole, getManageableRoles, getPermissionDisplayName, groupPermissionsByCategory, getRoleDisplayName, getRoleDescription } from '../../utils/permissions';
import { userAPI } from '../../lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  permissions: Permission[];
  is_active: boolean;
  created_at: string;
}

interface RoleManagementProps {
  currentUserRole: UserRole;
  currentUserPermissions: Permission[];
}

const RoleManagement: React.FC<RoleManagementProps> = ({ currentUserRole, currentUserPermissions }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersData = await userAPI.getUsers();
        const usersArray: User[] = Array.isArray(usersData) ? usersData as User[] : [];
        setUsers(usersArray);
      } catch (error) {
        console.error('Failed to load users:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const manageableRoles = getManageableRoles(currentUserRole);
  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!hasPermission(currentUserPermissions, 'users:assign_roles')) {
      alert('You do not have permission to assign roles');
      return;
    }

    if (!canManageRole(currentUserRole, newRole)) {
      alert('You cannot assign a role higher than or equal to your own');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Update user role via API
      await userAPI.updateUser(userId, {
        role: newRole,
        permissions: ROLE_PERMISSIONS[newRole]
      });

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, role: newRole, permissions: ROLE_PERMISSIONS[newRole] }
          : user
      ));

      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
      setError('Failed to update user role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, isActive: boolean) => {
    const permission = isActive ? 'users:activate' : 'users:suspend';
    if (!hasPermission(currentUserPermissions, permission)) {
      alert(`You do not have permission to ${isActive ? 'activate' : 'suspend'} users`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Update user status via API
      await userAPI.updateUser(userId, { is_active: isActive });

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
    } catch (error) {
      console.error('Failed to update user status:', error);
      setError('Failed to update user status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!hasPermission(currentUserPermissions, 'users:delete')) {
      alert('You do not have permission to delete users');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Delete user via API
      await userAPI.deleteUser(userId);

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Role Management</h2>
          <p className="text-gray-400">Manage user roles and permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowRoleModal(true)}
          disabled={!hasPermission(currentUserPermissions, 'users:create')}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-2 text-gray-400">Loading...</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.full_name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-white">{getRoleDisplayName(user.role)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        disabled={!hasPermission(currentUserPermissions, 'users:assign_roles') || !canManageRole(currentUserRole, user.role)}
                        className="flex items-center"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Role
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPermissionModal(true);
                        }}
                        disabled={!hasPermission(currentUserPermissions, 'users:edit')}
                        className="flex items-center"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Permissions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserStatusChange(user.id, !user.is_active)}
                        disabled={!hasPermission(currentUserPermissions, user.is_active ? 'users:suspend' : 'users:activate')}
                        className={`flex items-center ${user.is_active ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'}`}
                      >
                        {user.is_active ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={!hasPermission(currentUserPermissions, 'users:delete') || user.role === 'Super Admin'}
                        className="flex items-center text-red-500 border-red-500"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {selectedUser ? 'Change User Role' : 'Add New User'}
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedUser && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedUser.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-white font-medium">{selectedUser.full_name}</div>
                    <div className="text-gray-400 text-sm">{selectedUser.email}</div>
                    <div className="text-gray-400 text-sm">Current: {getRoleDisplayName(selectedUser.role)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {manageableRoles.map((role) => (
                <div
                  key={role}
                  className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 cursor-pointer"
                  onClick={() => selectedUser && handleRoleChange(selectedUser.id, role)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{getRoleDisplayName(role)}</h4>
                      <p className="text-gray-400 text-sm">{getRoleDescription(role)}</p>
                    </div>
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                User Permissions - {selectedUser.full_name}
              </h3>
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {selectedUser.full_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-white font-medium">{selectedUser.full_name}</div>
                  <div className="text-gray-400 text-sm">{selectedUser.email}</div>
                  <div className="text-gray-400 text-sm">Role: {getRoleDisplayName(selectedUser.role)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupPermissionsByCategory(selectedUser.permissions)).map(([category, permissions]) => (
                <div key={category} className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-gray-300">{getPermissionDisplayName(permission)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedUser(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
