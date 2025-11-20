import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Shield, Eye, EyeOff, CheckCircle, AlertTriangle, Crown, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'content_manager' | 'community_manager' | 'user_support' | 'super_admin';
  password: string;
  createdAt: Date;
  createdBy: string;
}

const CreateAdminUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'content_manager' as 'content_manager' | 'community_manager' | 'user_support' | 'super_admin',
    password: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(false);

  // Check if current user can create admin users
  const currentUserRole = profile?.role || 'user';
  const currentUserEmail = profile?.email || '';

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    // Name validation
    if (!formData.name.trim()) {
      validationErrors.push('Name is required');
    }

    // Email validation
    if (!formData.email.trim()) {
      validationErrors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.push('Please enter a valid email address');
    }

    // Password validation
    const passwordErrors = validatePassword(formData.password);
    validationErrors.push(...passwordErrors);

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    // Role validation for super_admin creation
    if (formData.role === 'super_admin' && currentUserRole !== 'super_admin') {
      validationErrors.push('Only super admins can create super admin accounts');
    }

    return validationErrors;
  };

  const logAuditEvent = (action: string, details: string) => {
    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    const newLog = {
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date().toISOString(),
      user: currentUserEmail
    };
    existingLogs.unshift(newLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);
    setIsSubmitting(true);
    setIsCheckingServer(true);

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      setIsCheckingServer(false);
      return;
    }

    try {
      // Check if backend server is running
      try {
        const healthCheck = await fetch('http://localhost:3002/api/health', { method: 'GET' });
        if (!healthCheck.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthError) {
        throw new Error('Unable to connect to the backend server. Please make sure it is running on port 3002.');
      }

      // Create user via API
      const response = await fetch('http://localhost:3002/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          full_name: formData.name.trim(),
          role: formData.role,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const result = await response.json();

      // Log audit event
      logAuditEvent('admin_user_created', `Created ${formData.role} account: ${formData.email} by ${currentUserEmail}`);

      setSuccess(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'content_manager',
        password: '',
        confirmPassword: ''
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/admin/manage-users');
      }, 3000);

    } catch (error: any) {
      console.error('Error creating admin user:', error);

      // Handle different types of errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors(['Unable to connect to the server. Please make sure the backend server is running.']);
      } else if (error.message.includes('already exists')) {
        setErrors(['An admin user with this email already exists']);
      } else if (error.message.includes('JSON')) {
        setErrors(['Server returned an invalid response. Please try again.']);
      } else {
        setErrors([error.message || 'Failed to create admin user. Please try again.']);
      }
    } finally {
      setIsSubmitting(false);
      setIsCheckingServer(false);
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

  const passwordStrength = getPasswordStrength(formData.password);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin': return <Crown className="h-5 w-5" />;
      case 'Instructor': return <Shield className="h-5 w-5" />;
      case 'Content Manager': return <Shield className="h-5 w-5" />;
      case 'Community Manager': return <UserPlus className="h-5 w-5" />;
      case 'User Support': return <User className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'Full system access, can manage all users and settings';
      case 'Instructor': return 'Can create and manage courses and content';
      case 'Content Manager': return 'Content creation and management permissions';
      case 'Community Manager': return 'Community moderation and management';
      case 'User Support': return 'User support and assistance';
      default: return 'Basic access permissions';
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/manage-users')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Create Admin User</h1>
              <p className="text-gray-400 mt-2">Add a new administrator to the platform</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h3 className="text-green-500 font-medium">Admin User Created Successfully!</h3>
                  <p className="text-green-400 text-sm">Redirecting to user management...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-6">
              <ErrorMessage
                title="Please fix the following errors:"
                message={errors.join(', ')}
                onClose={() => setErrors([])}
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Admin Role
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'content_manager', label: 'Content Manager' },
                  { value: 'community_manager', label: 'Community Manager' },
                  { value: 'user_support', label: 'User Support' },
                  ...(currentUserRole === 'super_admin' ? [{ value: 'super_admin', label: 'Super Admin' }] : [])
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.role === role.value
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getRoleIcon(role.value)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{role.label}</div>
                        <div className="text-gray-400 text-sm">{getRoleDescription(role.value)}</div>
                      </div>
                    </div>
                    {formData.role === role.value && (
                      <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-red-500" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.password ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, password: !showPasswords.password })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Password Strength:</span>
                    <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/manage-users')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isCheckingServer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking Server...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Admin User
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-green-500 font-medium">Ready to Create</h3>
                <p className="text-green-400 text-sm mt-1">
                  The new admin user will be created with the provided password and can log in immediately.
                  Make sure the backend server is running on port 3002 and frontend on port 3000/3001.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAdminUserPage;
