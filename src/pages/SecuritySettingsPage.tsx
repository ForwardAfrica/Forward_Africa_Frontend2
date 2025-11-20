import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Users, Activity, Settings, Eye, EyeOff, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import { usePermissions } from '../contexts/PermissionContext';
import PermissionGuard from '../components/ui/PermissionGuard';
import { Permission } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import Layout from '../components/layout/Layout';
import { standardizeRole } from '../lib/roleStandardization';

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionSettings: {
    sessionTimeout: number; // minutes
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  ipWhitelist: string[];
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
  };
  auditSettings: {
    logRetention: number; // days
    logLevel: 'basic' | 'detailed' | 'verbose';
  };
}

interface RolePermissions {
  [role: string]: {
    [permission: string]: boolean;
  };
}

const SecuritySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'security' | 'roles' | 'audit'>('security');
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    sessionSettings: {
      sessionTimeout: 30,
      maxConcurrentSessions: 3,
      requireReauth: true
    },
    ipWhitelist: [],
    twoFactorAuth: {
      enabled: false,
      required: false
    },
    auditSettings: {
      logRetention: 90,
      logLevel: 'detailed'
    }
  });

  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
    user: {
      view_courses: true,
      enroll_courses: true,
      create_courses: false,
      edit_courses: false,
      delete_courses: false,
      manage_users: false,
      view_analytics: false,
      manage_settings: false,
      access_audit_logs: false
    },
    content_manager: {
      view_courses: true,
      enroll_courses: true,
      create_courses: true,
      edit_courses: true,
      delete_courses: false,
      manage_users: false,
      view_analytics: false,
      manage_settings: false,
      access_audit_logs: false
    },
    admin: {
      view_courses: true,
      enroll_courses: true,
      create_courses: true,
      edit_courses: true,
      delete_courses: true,
      manage_users: true,
      view_analytics: true,
      manage_settings: true,
      access_audit_logs: true
    },
    super_admin: {
      view_courses: true,
      enroll_courses: true,
      create_courses: true,
      edit_courses: true,
      delete_courses: true,
      manage_users: true,
      view_analytics: true,
      manage_settings: true,
      access_audit_logs: true
    }
  });

  const [newIpAddress, setNewIpAddress] = useState('');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Check if user has permission to access this page
  const canManageSettings = hasPermission('system:configuration');
  const canAccessAuditLogs = hasPermission('audit:view_logs');

  // Redirect if user doesn't have permission
  if (!canManageSettings) {
    return (
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You do not have permission to access security settings.</p>
        </div>
      </div>
    );
  }

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('securitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedRolePermissions = localStorage.getItem('rolePermissions');
    if (savedRolePermissions) {
      setRolePermissions(JSON.parse(savedRolePermissions));
    }
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

  const logAuditEvent = (action: string, details: string) => {
    const auditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('adminEmail') || 'Unknown',
      action,
      details,
      ipAddress: '192.168.1.100'
    };

    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.unshift(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000)));
  };

  const handleSaveSettings = async () => {
    if (!canManageSettings) {
      setPermissionError('You do not have permission to save security settings. This action requires Admin or Super Admin privileges.');
      return;
    }

    setSaveStatus('saving');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('securitySettings', JSON.stringify(settings));
      localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));

      logAuditEvent('security_settings_updated', 'Updated security settings and role permissions');

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleAddIpAddress = () => {
    if (newIpAddress && !settings.ipWhitelist.includes(newIpAddress)) {
      setSettings(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIpAddress]
      }));
      setNewIpAddress('');
      logAuditEvent('ip_whitelist_added', `Added IP address to whitelist: ${newIpAddress}`);
    }
  };

  const handleRemoveIpAddress = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(address => address !== ip)
    }));
    logAuditEvent('ip_whitelist_removed', `Removed IP address from whitelist: ${ip}`);
  };

  const handleRolePermissionChange = (role: string, permission: string, value: boolean) => {
    // Only super_admin can modify admin and super_admin permissions
    if ((role === 'admin' || role === 'super_admin') && userRole !== 'super_admin') {
      setPermissionError('Only Super Administrators can modify Admin and Super Admin permissions.');
      return;
    }

    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: value
      }
    }));
    logAuditEvent('role_permission_changed', `Changed ${role} permission ${permission} to ${value}`);
  };

  const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  const currentUserRole = userRole;

  return (
    <Layout>
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
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Security Settings</h1>
          <p className="text-gray-400 mt-2">Manage platform security and user permissions</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
          className="flex items-center"
        >
          {saveStatus === 'saving' ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
          ) : saveStatus === 'saved' ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : saveStatus === 'error' ? (
            <AlertTriangle className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-8">
        <div className="flex space-x-8">
          {[
                  { id: 'security', label: 'Security Policies', icon: Shield, permission: 'system:configuration' },
      { id: 'roles', label: 'Role Management', icon: Users, permission: 'system:configuration' },
      { id: 'audit', label: 'Audit Settings', icon: Activity, permission: 'audit:view_logs' }
          ].map(({ id, label, icon: Icon, permission }) => (
            <PermissionGuard key={id} permission={permission as Permission}>
              <button
                onClick={() => setActiveTab(id as any)}
                className={`pb-4 relative flex items-center space-x-2 ${
                  activeTab === id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                {activeTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
            </PermissionGuard>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'security' && (
        <PermissionGuard
          permission="system:configuration"
        >
          <div className="space-y-8">
            {/* Password Policy */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Password Policy</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="32"
                    value={settings.passwordPolicy.minLength}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="text-white font-medium">Password Requirements</h4>

                {[
                  { key: 'requireUppercase', label: 'Require uppercase letters' },
                  { key: 'requireLowercase', label: 'Require lowercase letters' },
                  { key: 'requireNumbers', label: 'Require numbers' },
                  { key: 'requireSpecialChars', label: 'Require special characters' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-300">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.passwordPolicy[key as keyof typeof settings.passwordPolicy] as boolean}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          passwordPolicy: { ...prev.passwordPolicy, [key]: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Session Management</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessionSettings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      sessionSettings: { ...prev.sessionSettings, sessionTimeout: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Concurrent Sessions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.sessionSettings.maxConcurrentSessions}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      sessionSettings: { ...prev.sessionSettings, maxConcurrentSessions: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-gray-300">Require re-authentication for sensitive actions</span>
                    <p className="text-gray-400 text-sm">Users must re-enter password for critical operations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sessionSettings.requireReauth}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        sessionSettings: { ...prev.sessionSettings, requireReauth: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* IP Whitelist */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">IP Address Whitelist</h3>

              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                  placeholder="Enter IP address (e.g., 192.168.1.1)"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Button
                  variant="primary"
                  onClick={handleAddIpAddress}
                  disabled={!newIpAddress}
                >
                  Add IP
                </Button>
              </div>

              <div className="space-y-2">
                {settings.ipWhitelist.length > 0 ? (
                  settings.ipWhitelist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">{ip}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveIpAddress(ip)}
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No IP addresses in whitelist</p>
                )}
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Two-Factor Authentication</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-gray-300">Enable Two-Factor Authentication</span>
                    <p className="text-gray-400 text-sm">Allow users to enable 2FA for their accounts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        twoFactorAuth: { ...prev.twoFactorAuth, enabled: e.target.checked }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-gray-300">Require Two-Factor Authentication</span>
                    <p className="text-gray-400 text-sm">Force all users to enable 2FA</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth.required}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        twoFactorAuth: { ...prev.twoFactorAuth, required: e.target.checked }
                      }))}
                      disabled={!settings.twoFactorAuth.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 disabled:opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}

      {activeTab === 'roles' && (
        <PermissionGuard
          permission="system:configuration"
        >
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Role-Based Permissions</h3>
              <p className="text-gray-400 mb-6">Configure permissions for each user role. Changes apply to all users with that role.</p>

              <div className="space-y-6">
                {Object.entries(rolePermissions).map(([role, permissions]) => (
                  <div key={role} className="border border-gray-700 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center">
                      {role === 'super_admin' && <Shield className="h-5 w-5 mr-2 text-purple-500" />}
                      {role === 'admin' && <Shield className="h-5 w-5 mr-2 text-blue-500" />}
                      {role === 'content_manager' && <Users className="h-5 w-5 mr-2 text-green-500" />}
                      {role === 'user' && <Users className="h-5 w-5 mr-2 text-gray-400" />}
                      {role.replace('_', ' ').toUpperCase()}

                      {/* Show warning for protected roles */}
                      {(role === 'admin' || role === 'super_admin') && userRole !== 'super_admin' && (
                        <span className="ml-2 text-xs text-yellow-400">
                          (Only Super Admins can modify these permissions)
                        </span>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(permissions).map(([permission, value]) => {
                        // Determine if this permission can be modified by current user
                        const canModify = !(
                          (role === 'admin' || role === 'super_admin') &&
                          userRole !== 'super_admin'
                        );

                        return (
                          <div key={permission} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div>
                              <span className="text-gray-300 text-sm">
                                {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleRolePermissionChange(role, permission, e.target.checked)}
                                disabled={!canModify || role === 'user' && !['view_courses', 'enroll_courses'].includes(permission)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 disabled:opacity-50"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}

      {activeTab === 'audit' && (
        <PermissionGuard
          permission="audit:view_logs"
        >
          <div className="space-y-8">
            {/* Audit Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Audit Log Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Log Retention Period (days)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={settings.auditSettings.logRetention}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      auditSettings: { ...prev.auditSettings, logRetention: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Audit Log Level
                  </label>
                  <select
                    value={settings.auditSettings.logLevel}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      auditSettings: { ...prev.auditSettings, logLevel: e.target.value as any }
                    }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="basic">Basic</option>
                    <option value="detailed">Detailed</option>
                    <option value="verbose">Verbose</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recent Audit Logs */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Audit Activity</h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {auditLogs.slice(0, 10).map((log: any) => (
                      <tr key={log.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                          {log.user}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                            {log.action.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300 max-w-md truncate">
                          {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {auditLogs.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No audit logs available</p>
                </div>
              )}
            </div>
          </div>
        </PermissionGuard>
      )}
    </Layout>
  );
};

export default SecuritySettingsPage;
