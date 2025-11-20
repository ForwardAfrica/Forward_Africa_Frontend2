import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Shield, Eye, EyeOff, Save, CheckCircle, AlertTriangle, Lock, Activity, Calendar, Crown, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import Layout from '../components/layout/Layout';

const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { userRole } = usePermissions();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if user is authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  // Get admin info from Firebase Auth and profile
  const adminEmail = user?.email || profile?.email || 'admin@forwardafrica.com';
  const adminRole = userRole || 'admin';
  const loginDate = new Date().toISOString();

  // Check if user can access this page (content_manager, admin, super_admin)
  const allowedRoles = ['content_manager', 'admin', 'super_admin'];
  if (!allowedRoles.includes(adminRole)) {
    navigate('/admin');
    return null;
  }

  // Mock admin data
  const adminData = {
    name: getDisplayName(adminRole),
    email: adminEmail,
    role: adminRole,
    loginDate: new Date(loginDate),
    lastPasswordChange: new Date('2024-01-01'),
    permissions: getPermissionsText(adminRole),
    sessionsActive: 1,
    lastActivity: new Date()
  };

  function getDisplayName(role: string): string {
    switch (role) {
      case 'Super Admin': return 'Super Administrator';
      case 'Instructor': return 'Instructor';
      case 'Content Manager': return 'Content Manager';
      case 'Community Manager': return 'Community Manager';
      case 'User Support': return 'User Support';
      default: return 'User';
    }
  }

  function getPermissionsText(role: string): string {
    switch (role) {
      case 'Super Admin': return 'Full System Access';
      case 'Instructor': return 'Content Creation & Management';
      case 'Content Manager': return 'Content Management';
      case 'Community Manager': return 'Community Moderation';
      case 'User Support': return 'User Support & Assistance';
      default: return 'Limited Access';
    }
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return errors;
  };

  const logAuditEvent = (action: string, details: string) => {
    const auditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: adminEmail,
      action,
      details,
      ipAddress: '192.168.1.100'
    };

    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.unshift(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000)));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors([]);
    setPasswordSuccess(false);
    setIsSubmitting(true);

    // Validate current password (in real app, this would be verified against backend)
    if (!passwordForm.currentPassword) {
      setPasswordErrors(['Current password is required']);
      setIsSubmitting(false);
      return;
    }

    // For demo purposes, check against known admin passwords
    const validCurrentPasswords = {
      'admin@forwardafrica.com': 'admin123',
      'superadmin@forwardafrica.com': 'super123',
      'contentmanager@forwardafrica.com': 'content123'
    };

    if (passwordForm.currentPassword !== validCurrentPasswords[adminEmail as keyof typeof validCurrentPasswords]) {
      setPasswordErrors(['Current password is incorrect']);
      setIsSubmitting(false);
      return;
    }

    // Validate new password
    const newPasswordErrors = validatePassword(passwordForm.newPassword);
    if (newPasswordErrors.length > 0) {
      setPasswordErrors(newPasswordErrors);
      setIsSubmitting(false);
      return;
    }

    // Check if passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(['New passwords do not match']);
      setIsSubmitting(false);
      return;
    }

    // Check if new password is different from current
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordErrors(['New password must be different from current password']);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Log the password change
      logAuditEvent('password_changed', `Password changed for: ${adminEmail} (${adminRole})`);

      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess(false);
      }, 3000);

    } catch (error) {
      setPasswordErrors(['Failed to change password. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    const errors = validatePassword(password);
    const strength = Math.max(0, 5 - errors.length);

    if (strength === 0) return { strength: 0, label: 'Very Weak', color: 'bg-red-500' };
    if (strength === 1) return { strength: 20, label: 'Weak', color: 'bg-red-400' };
    if (strength === 2) return { strength: 40, label: 'Fair', color: 'bg-yellow-500' };
    if (strength === 3) return { strength: 60, label: 'Good', color: 'bg-yellow-400' };
    if (strength === 4) return { strength: 80, label: 'Strong', color: 'bg-green-500' };
    return { strength: 100, label: 'Very Strong', color: 'bg-green-600' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const getRoleBadge = (role: string) => {
    const styles = {
      'Content Manager': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Instructor': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Community Manager': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'User Support': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Super Admin': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return styles[role as keyof typeof styles] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin': return <Crown className="h-5 w-5" />;
      case 'Instructor': return <UserPlus className="h-5 w-5" />;
      case 'Content Manager': return <UserPlus className="h-5 w-5" />;
      case 'Community Manager': return <Users className="h-5 w-5" />;
      case 'User Support': return <User className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Account Profile</h1>
          <p className="text-gray-400 mt-2">Manage your account and security settings</p>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center">
          <div className="bg-gray-700 rounded-full p-4 mr-6">
            {getRoleIcon(adminRole)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{adminData.name}</h2>
            <p className="text-gray-400 mb-3">{adminData.email}</p>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadge(adminRole)}`}>
                {adminRole.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-gray-400 text-sm">
                Last login: {adminData.loginDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 relative ${
              activeTab === 'profile'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Profile Information
            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 relative ${
              activeTab === 'security'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Security Settings
            {activeTab === 'security' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          {/* Account Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">Name</div>
                    <div className="text-white">{adminData.name}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="text-white">{adminData.email}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  {getRoleIcon(adminRole)}
                  <div className="ml-3">
                    <div className="text-sm text-gray-400">Role</div>
                    <div className="text-white">{adminRole.replace('_', ' ').toUpperCase()}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">Last Login</div>
                    <div className="text-white">{adminData.loginDate.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">Active Sessions</div>
                    <div className="text-white">{adminData.sessionsActive}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-400">Permissions</div>
                    <div className="text-white">{adminData.permissions}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific Permissions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Role Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getRolePermissions(adminRole).map((permission, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-700 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{permission}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Account Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {JSON.parse(localStorage.getItem('auditLogs') || '[]').filter((log: any) => log.user === adminEmail).length}
                </div>
                <div className="text-gray-400">Actions Performed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.floor((Date.now() - adminData.loginDate.getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-gray-400">Days Since Login</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.floor((Date.now() - adminData.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-gray-400">Days Since Password Change</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8">
          {/* Password Security */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Password Security</h3>
                <p className="text-gray-400">
                  Last changed: {adminData.lastPasswordChange.toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowChangePassword(true)}
                className="flex items-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>

            {/* Password Change Modal */}
            {showChangePassword && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold text-white mb-6">Change Password</h3>

                  {passwordSuccess && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-400">Password changed successfully!</span>
                      </div>
                    </div>
                  )}

                  {passwordErrors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          {passwordErrors.map((error, index) => (
                            <p key={index} className="text-red-400 text-sm">{error}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          disabled={isSubmitting}
                        >
                          {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          disabled={isSubmitting}
                        >
                          {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordForm.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Password Strength</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.strength >= 80 ? 'text-green-400' :
                              passwordStrength.strength >= 60 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          disabled={isSubmitting}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white mb-2">Password Requirements:</h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li className={passwordForm.newPassword.length >= 8 ? 'text-green-400' : ''}>
                          • At least 8 characters long
                        </li>
                        <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-400' : ''}>
                          • One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(passwordForm.newPassword) ? 'text-green-400' : ''}>
                          • One lowercase letter
                        </li>
                        <li className={/\d/.test(passwordForm.newPassword) ? 'text-green-400' : ''}>
                          • One number
                        </li>
                        <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? 'text-green-400' : ''}>
                          • One special character
                        </li>
                      </ul>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setPasswordErrors([]);
                          setPasswordSuccess(false);
                        }}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 flex items-center justify-center"
                        disabled={passwordSuccess || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Changing...
                          </>
                        ) : passwordSuccess ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Changed!
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Security Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Password Strength</h4>
                    <p className="text-gray-400 text-sm">Last changed {Math.floor((Date.now() - adminData.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24))} days ago</p>
                  </div>
                  <span className="text-green-400 text-sm">Strong</span>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Account Security</h4>
                    <p className="text-gray-400 text-sm">{getDisplayName(adminRole)} protection</p>
                  </div>
                  <span className="text-green-400 text-sm">Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Security Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Security Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div>
                  <p className="text-white">{getDisplayName(adminRole)} login from Chrome on Windows</p>
                  <p className="text-gray-400 text-sm">IP: 192.168.1.100 • {adminData.loginDate.toLocaleString()}</p>
                </div>
                <span className="text-green-400 text-sm">Current session</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div>
                  <p className="text-white">Account permissions verified</p>
                  <p className="text-gray-400 text-sm">Role-based access confirmed • 1 day ago</p>
                </div>
                <span className="text-blue-400 text-sm">Security check</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white">Account created</p>
                  <p className="text-gray-400 text-sm">Account initialization • {adminData.lastPasswordChange.toLocaleDateString()}</p>
                </div>
                <span className="text-gray-400 text-sm">Account setup</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

function getRolePermissions(role: string): string[] {
  const permissions = {
    content_manager: [
      'View Courses',
      'Create Courses',
      'Edit Courses',
      'Manage Content',
      'View Basic Analytics'
    ],
    admin: [
      'View Courses',
      'Create Courses',
      'Edit Courses',
      'Delete Courses',
      'Manage Users',
      'View Analytics',
      'Manage Settings',
      'Access Audit Logs'
    ],
    super_admin: [
      'Full System Access',
      'Manage All Users',
      'Manage Admins',
      'Security Settings',
      'System Configuration',
      'Advanced Analytics',
      'Audit Management',
      'Platform Control'
    ]
  };

  return permissions[role as keyof typeof permissions] || ['Limited Access'];
}

export default AdminProfilePage;
