import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Mail, Lock, Bell, Shield, CreditCard, LogOut, Eye, EyeOff, CheckCircle, AlertTriangle, X, Save, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress, useCertificates } from '../hooks/useDatabase';
import ImageUpload from '../components/ui/ImageUpload';
import ProfileCompletionPrompt from '../components/ui/ProfileCompletionPrompt';
import Layout from '../components/layout/Layout';
import Image from 'next/image';
import EditProfileForm from '../components/ui/EditProfileForm';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, loading: authLoading, checkAuthStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security'>('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
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
  const [loading, setLoading] = useState(false);

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    achievementAlerts: true,
    marketingEmails: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showProgress: true,
    showCertificates: true,
    allowMessages: true,
    dataSharing: false
  });

  const [billingInfo, setBillingInfo] = useState({
    plan: 'Free',
    nextBilling: 'Never',
    paymentMethod: 'None',
    autoRenew: false
  });

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    full_name: '',
    avatar_url: '',
    industry: '',
    experience_level: '',
    business_stage: '',
    country: '',
    state_province: '',
    city: ''
  });
  const formInitializedRef = useRef(false);
  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Database hooks
  const {
    progress: userProgress,
    loading: progressLoading,
    fetchUserProgress
  } = useUserProgress(user?.id || '');

  const {
    certificates: userCertificates,
    loading: certificatesLoading,
    fetchUserCertificates
  } = useCertificates(user?.id || '');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Fetch user data when user is available
  useEffect(() => {
    if (user?.id) {
      fetchUserProgress();
      fetchUserCertificates();
    }
  }, [user?.id, fetchUserProgress, fetchUserCertificates]);

  // Force refresh user data from database when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      // Force fetch fresh user data from database
      checkAuthStatus();
      console.log('🔄 ProfilePage: Forcing fresh user data fetch from database');
    }
  }, [user?.id, checkAuthStatus]);

  // Initialize form data when user data is available or changes
  useEffect(() => {
    if (user) {
      setEditProfileForm({
        full_name: user.full_name || user.displayName || user.fullName || '',
        avatar_url: user.avatar_url || user.photoURL || user.avatarUrl || '',
        industry: user.industry || '',
        experience_level: user.experience_level || '',
        business_stage: user.business_stage || '',
        country: user.country || '',
        state_province: user.state_province || '',
        city: user.city || ''
      });
      formInitializedRef.current = true;
    } else {
      // Reset form when user is null (logout)
      setEditProfileForm({
        full_name: '',
        avatar_url: '',
        industry: '',
        experience_level: '',
        business_stage: '',
        country: '',
        state_province: '',
        city: ''
      });
      formInitializedRef.current = false;
    }
  }, [user?.id, user]); // Depend on both user ID and user object to catch logout

  // Clear any remaining cached data when user becomes null (logout)
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      // Force clear any remaining user-specific data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('profile_prompt_') ||
          key.startsWith('user_') ||
          key.startsWith('userLevel') ||
          key.startsWith('achievements') ||
          key.startsWith('learningStreak') ||
          key.startsWith('certificates') ||
          key.startsWith('notifications') ||
          key.startsWith('userBehavior_') ||
          key.startsWith('videoTracking_') ||
          key.startsWith('audit_logs')
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 ProfilePage: Cleared cached data: ${key}`);
      });
    }
  }, [user]);



  // Calculate user statistics from database
  const completedCourses = userProgress.filter(p => p.completed).length;
  const totalHoursWatched = userProgress.reduce((total, p) => total + (p.progress || 0), 0) / 100; // Rough estimate
  const certificatesEarned = userCertificates.length;

  // Get user data from auth context with better fallbacks and memoization
  const userData = useMemo(() => {
    const avatarUrl = user?.avatar_url || profile?.avatar_url || '/images/placeholder-avatar.jpg';
    // Add cache-busting parameter to force image reload when user changes
    const cacheBustedAvatar = avatarUrl.includes('?')
      ? `${avatarUrl}&t=${Date.now()}`
      : `${avatarUrl}?t=${Date.now()}`;

    return {
      name: user?.full_name || profile?.full_name || 'User',
      email: user?.email || profile?.email || 'user@example.com',
      avatar: cacheBustedAvatar,
      joinDate: new Date(), // We'll add created_at to AuthUser interface later
      coursesCompleted: completedCourses,
      hoursWatched: Math.round(totalHoursWatched * 10), // Convert to hours
      certificatesEarned: certificatesEarned,
      lastPasswordChange: new Date('2023-12-15') // This would come from user's password history
    };
  }, [user?.full_name, user?.email, user?.avatar_url, profile?.full_name, profile?.email, profile?.avatar_url, completedCourses, totalHoursWatched, certificatesEarned]);

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors([]);
    setPasswordSuccess(false);

    // Validate current password (in real app, this would be verified against backend)
    if (!passwordForm.currentPassword) {
      setPasswordErrors(['Current password is required']);
      return;
    }

    // Validate new password
    const newPasswordErrors = validatePassword(passwordForm.newPassword);
    if (newPasswordErrors.length > 0) {
      setPasswordErrors(newPasswordErrors);
      return;
    }

    // Check if passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(['New passwords do not match']);
      return;
    }

    // Check if new password is different from current
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordErrors(['New password must be different from current password']);
      return;
    }

    try {
      // Make API call to change password
      console.log('Changing password...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('forward_africa_token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setPasswordSuccess(true);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Password change error:', error);
      setPasswordErrors([error instanceof Error ? error.message : 'Failed to change password. Please try again.']);
    }
  };

  const handleLogout = async () => {
    await signOut();
    // Redirect to home - AuthContext will handle this
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      return;
    }

    try {
      // Make API call to delete account
      console.log('Deleting account...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/users/${user?.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('forward_africa_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      await signOut();
      // Redirect to home - AuthContext will handle this
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  // Enhanced profile validation function
  const validateProfileData = (data: typeof editProfileForm): string[] => {
    const errors: string[] = [];

    // Required field validation
    if (!data.full_name?.trim()) {
      errors.push('Full name is required');
    }

    // Length validation
    if (data.full_name?.trim() && data.full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (data.full_name?.trim() && data.full_name.trim().length > 100) {
      errors.push('Full name must be less than 100 characters');
    }

    // URL validation for avatar
    if (data.avatar_url && !isValidUrl(data.avatar_url)) {
      errors.push('Avatar URL must be a valid URL');
    }

    // Industry validation
    if (data.industry && data.industry.length > 50) {
      errors.push('Industry must be less than 50 characters');
    }

    // Location validation
    if (data.country && data.country.length > 50) {
      errors.push('Country must be less than 50 characters');
    }

    if (data.state_province && data.state_province.length > 50) {
      errors.push('State/Province must be less than 50 characters');
    }

    if (data.city && data.city.length > 50) {
      errors.push('City must be less than 50 characters');
    }

    return errors;
  };

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Create a completely isolated form component to prevent re-render issues
  const EditProfileForm = React.memo(({
    initialData,
    onSubmit,
    onCancel,
    loading,
    errors,
    success
  }: {
    initialData: {
      full_name: string;
      avatar_url: string;
      industry: string;
      experience_level: string;
      business_stage: string;
      country: string;
      state_province: string;
      city: string;
    };
    onSubmit: (data: {
      full_name: string;
      avatar_url: string;
      industry: string;
      experience_level: string;
      business_stage: string;
      country: string;
      state_province: string;
      city: string;
    }) => void;
    onCancel: () => void;
    loading: boolean;
    errors: string[];
    success: boolean;
  }) => {
    const [formData, setFormData] = useState(initialData);

    // Update form data when initial data changes (only when modal opens)
    useEffect(() => {
      setFormData(initialData);
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Image */}
        <ImageUpload
          onImageUpload={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
          currentImage={formData.avatar_url}
          uploadType="avatar"
          label="Profile Image"
          previewSize="md"
        />

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select your industry</option>
            <option value="Agriculture & Agribusiness">Agriculture & Agribusiness</option>
            <option value="Technology & Digital Innovation">Technology & Digital Innovation</option>
            <option value="Financial Services & Fintech">Financial Services & Fintech</option>
            <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
            <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
            <option value="Energy & Renewable Resources">Energy & Renewable Resources</option>
            <option value="Tourism & Hospitality">Tourism & Hospitality</option>
            <option value="Education & Training">Education & Training</option>
            <option value="Real Estate & Construction">Real Estate & Construction</option>
            <option value="Transportation & Logistics">Transportation & Logistics</option>
            <option value="Retail & E-commerce">Retail & E-commerce</option>
            <option value="Media & Entertainment">Media & Entertainment</option>
            <option value="Telecommunications">Telecommunications</option>
            <option value="Mining & Natural Resources">Mining & Natural Resources</option>
            <option value="Textiles & Fashion">Textiles & Fashion</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Consulting & Professional Services">Consulting & Professional Services</option>
            <option value="Non-profit & Social Enterprise">Non-profit & Social Enterprise</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Experience Level
          </label>
          <select
            value={formData.experience_level}
            onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select your experience level</option>
            <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
            <option value="Mid-Level (3-7 years)">Mid-Level (3-7 years)</option>
            <option value="Senior (8+ years)">Senior (8+ years)</option>
          </select>
        </div>

        {/* Business Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Business Stage
          </label>
          <select
            value={formData.business_stage}
            onChange={(e) => setFormData(prev => ({ ...prev, business_stage: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select your business stage</option>
            <option value="Idea Stage">Idea Stage</option>
            <option value="Startup">Startup</option>
            <option value="Growth Stage">Growth Stage</option>
            <option value="Established Business">Established Business</option>
          </select>
        </div>

        {/* Geographic Location */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Geographic Location
          </label>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select your country</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="Ghana">Ghana</option>
              <option value="Ethiopia">Ethiopia</option>
              <option value="Uganda">Uganda</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Morocco">Morocco</option>
              <option value="Egypt">Egypt</option>
              <option value="Algeria">Algeria</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* State/Province */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              State/Province
            </label>
            <input
              type="text"
              value={formData.state_province}
              onChange={(e) => setFormData(prev => ({ ...prev, state_province: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your state or province"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your city"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex items-center"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    );
  });

  // Reset form when modal is opened/closed
  const handleEditProfileModalToggle = useCallback((isOpen: boolean) => {
    if (isOpen && user) {
      // Reset form to current user data when opening
      setEditProfileForm({
        full_name: user.full_name || '',
        avatar_url: user.avatar_url || '',
        industry: user.industry || '',
        experience_level: user.experience_level || '',
        business_stage: user.business_stage || '',
        country: user.country || '',
        state_province: user.state_province || '',
        city: user.city || ''
      });
    }
    setShowEditProfile(isOpen);
    setProfileErrors([]);
    setProfileSuccess(false);
  }, [user]);

  // Enhanced profile update handler with comprehensive checks
  const handleEditProfile = async (formData: any) => {

    // Prevent multiple submissions
    if (profileLoading) {
      console.log('🔄 Profile update already in progress, ignoring duplicate submission');
      return;
    }

    // Reset state
    setProfileErrors([]);
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      // Authentication check
      if (!user?.id) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // Validate form data
      const validationErrors = validateProfileData(formData);
      if (validationErrors.length > 0) {
        setProfileErrors(validationErrors);
        return;
      }

      // Check if data has actually changed
      const hasChanges =
        user.full_name !== formData.full_name.trim() ||
        user.avatar_url !== formData.avatar_url ||
        user.industry !== formData.industry ||
        user.experience_level !== formData.experience_level ||
        user.business_stage !== formData.business_stage ||
        user.country !== formData.country ||
        user.state_province !== formData.state_province ||
        user.city !== formData.city;

      if (!hasChanges) {
        setProfileErrors(['No changes detected. Please modify at least one field before saving.']);
        return;
      }

      // Prepare update data with proper sanitization
      const updateData = {
        full_name: formData.full_name.trim(),
        avatar_url: formData.avatar_url || undefined,
        industry: formData.industry || undefined,
        experience_level: formData.experience_level || undefined,
        business_stage: formData.business_stage || undefined,
        country: formData.country || undefined,
        state_province: formData.state_province || undefined,
        city: formData.city || undefined
      };

      console.log('🔄 Profile update initiated for user:', user.id);
      console.log('📝 Update data:', updateData);

      // Perform the update
      const updatedUser = await updateProfile(updateData);

      // Validate the response
      if (!updatedUser || !updatedUser.id) {
        throw new Error('Invalid response from server. Please try again.');
      }

      console.log('✅ Profile updated successfully:', {
        userId: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name
      });

      // Show success message
      setProfileSuccess(true);

      // Auto-close modal after success (with delay for user feedback)
      setTimeout(() => {
        handleEditProfileModalToggle(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Profile update error:', error);

      // Enhanced error handling
      let errorMessage = 'Failed to update profile';

      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.message.includes('403') || error.message.includes('forbidden')) {
          errorMessage = 'You do not have permission to update this profile.';
        } else if (error.message.includes('500') || error.message.includes('server')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('validation') || error.message.includes('invalid')) {
          errorMessage = 'Invalid data provided. Please check your input.';
        } else {
          errorMessage = error.message;
        }
      }

      setProfileErrors([errorMessage]);
    } finally {
      setProfileLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    let label = 'Very Weak';
    let color = 'text-red-400';

    if (password.length >= 8) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    if (strength >= 80) {
      label = 'Strong';
      color = 'text-green-400';
    } else if (strength >= 60) {
      label = 'Good';
      color = 'text-blue-400';
    } else if (strength >= 40) {
      label = 'Fair';
      color = 'text-yellow-400';
    } else if (strength >= 20) {
      label = 'Weak';
      color = 'text-orange-400';
    }

    return { strength, label, color };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  // Add loading state and authentication check after all hooks
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

  // NOTE: Removed auto-redirect for unauthenticated users
  // AuthContext now handles redirects to login
  // If user is not authenticated, AuthContext will redirect them
  // This component will not be rendered if user is not authenticated

  return (
    <Layout key={user?.id || 'no-user'}>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile & Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>

          {/* Profile Completion Prompt - Show for users with incomplete profiles */}
          <div className="mb-8">
            <ProfileCompletionPrompt user={user} variant="card" />
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid gap-8">
              {/* Profile Information */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                <div className="flex items-center space-x-6 mb-6">
                  {userData.avatar.startsWith('http') ? (
                    <img
                      key={`${user?.id || 'no-user'}-${Date.now()}`}
                      src={userData.avatar}
                      alt={userData.name}
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/images/placeholder-avatar.jpg') {
                          target.src = '/images/placeholder-avatar.jpg';
                        }
                      }}
                    />
                  ) : (
                    <Image
                      key={`${user?.id || 'no-user'}-${Date.now()}`}
                      src={userData.avatar}
                      alt={userData.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/images/placeholder-avatar.jpg') {
                          target.src = '/images/placeholder-avatar.jpg';
                        }
                      }}
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{userData.name}</h3>
                    <p className="text-gray-400">{userData.email}</p>
                    <p className="text-sm text-gray-500">Member since {userData.joinDate.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-400">Full Name</div>
                      <div className="text-white">{userData.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="text-white">{userData.email}</div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => handleEditProfileModalToggle(true)}
                >
                  Edit Profile
                </Button>
              </div>

              {/* Certificates */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Certificates</h2>
                {userData.certificatesEarned > 0 ? (
                  <div className="grid gap-4">
                    {/* Certificate items would go here */}
                    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Business Fundamentals</h3>
                        <p className="text-gray-400 text-sm">Completed on Jan 15, 2024</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No certificates earned yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="grid gap-8">
              {/* Password Security */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Password Security</h2>
                    <p className="text-gray-400">
                      Last changed: {userData.lastPasswordChange.toLocaleDateString()}
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
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Password Strength Indicator */}
                          {passwordForm.newPassword && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400">Password Strength</span>
                                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                  {passwordStrength.label}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    passwordStrength.strength >= 80 ? 'bg-green-500' :
                                    passwordStrength.strength >= 60 ? 'bg-blue-500' :
                                    passwordStrength.strength >= 40 ? 'bg-yellow-500' :
                                    passwordStrength.strength >= 20 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${passwordStrength.strength}%` }}
                                />
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
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={loading}
                          >
                            {loading ? 'Changing...' : 'Change Password'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowChangePassword(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Security Activity */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Recent Security Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-700">
                    <div>
                      <p className="text-white">Login from Chrome on Windows</p>
                      <p className="text-gray-400 text-sm">IP: 192.168.1.100 • Today at 2:30 PM</p>
                    </div>
                    <span className="text-green-400 text-sm">Current session</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-700">
                    <div>
                      <p className="text-white">Login from Safari on iPhone</p>
                      <p className="text-gray-400 text-sm">IP: 192.168.1.105 • Yesterday at 8:15 AM</p>
                    </div>
                    <span className="text-gray-400 text-sm">Successful</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-white">Password changed</p>
                      <p className="text-gray-400 text-sm">{userData.lastPasswordChange.toLocaleDateString()} at 10:45 AM</p>
                    </div>
                    <span className="text-blue-400 text-sm">Security update</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid gap-8">
              {/* Account Settings */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-white">Notifications</div>
                        <div className="text-sm text-gray-400">Manage notification preferences</div>
                      </div>
                    </div>
                    <div className="text-gray-400">›</div>
                  </button>

                  <button
                    onClick={() => setShowPrivacy(true)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-white">Privacy</div>
                        <div className="text-sm text-gray-400">Manage privacy settings</div>
                      </div>
                    </div>
                    <div className="text-gray-400">›</div>
                  </button>

                  <button
                    onClick={() => setShowBilling(true)}
                    className="w-full flex items-center justify-between text-left p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-white">Billing</div>
                        <div className="text-sm text-gray-400">Manage payment methods and subscriptions</div>
                      </div>
                    </div>
                    <div className="text-gray-400">›</div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Danger Zone</h2>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-between text-red-500 border-red-500 hover:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    <span className="flex items-center">
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </span>
                    <span>›</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-red-500 border-red-500 hover:bg-red-500/10"
                    onClick={() => setShowDeleteAccount(true)}
                  >
                    <span className="flex items-center">
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete Account
                    </span>
                    <span>›</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Modal */}
          <Modal isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="Notification Settings">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Email Notifications</h4>
                    <p className="text-gray-400 text-sm">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Push Notifications</h4>
                    <p className="text-gray-400 text-sm">Receive push notifications in browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Course Updates</h4>
                    <p className="text-gray-400 text-sm">Get notified about new course content</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.courseUpdates}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, courseUpdates: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Achievement Alerts</h4>
                    <p className="text-gray-400 text-sm">Get notified when you earn achievements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.achievementAlerts}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, achievementAlerts: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Marketing Emails</h4>
                    <p className="text-gray-400 text-sm">Receive promotional emails and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button variant="outline" onClick={() => setShowNotifications(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>

          {/* Privacy Modal */}
          <Modal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Settings">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Profile Visibility</h4>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Show Progress</h4>
                    <p className="text-gray-400 text-sm">Allow others to see your course progress</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.showProgress}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, showProgress: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Show Certificates</h4>
                    <p className="text-gray-400 text-sm">Allow others to see your earned certificates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.showCertificates}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, showCertificates: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Allow Messages</h4>
                    <p className="text-gray-400 text-sm">Allow other users to send you messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.allowMessages}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, allowMessages: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Data Sharing</h4>
                    <p className="text-gray-400 text-sm">Allow us to use your data for analytics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataSharing}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataSharing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button variant="outline" onClick={() => setShowPrivacy(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>

          {/* Billing Modal */}
          <Modal isOpen={showBilling} onClose={() => setShowBilling(false)} title="Billing & Subscription">
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Current Plan</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{billingInfo.plan}</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Next billing: {billingInfo.nextBilling}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Payment Method</h4>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300">{billingInfo.paymentMethod}</p>
                    <p className="text-gray-400 text-sm mt-1">No payment method on file</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Auto-Renew</h4>
                    <p className="text-gray-400 text-sm">Automatically renew your subscription</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={billingInfo.autoRenew}
                      onChange={(e) => setBillingInfo(prev => ({ ...prev, autoRenew: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button variant="outline" onClick={() => setShowBilling(false)}>
                  Close
                </Button>
                <Button variant="primary">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </Modal>

          {/* Edit Profile Modal */}
          <Modal isOpen={showEditProfile} onClose={() => handleEditProfileModalToggle(false)} title="Edit Profile">
            <div className="space-y-6">
              {profileSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-400">Profile updated successfully!</span>
                  </div>
                </div>
              )}

              {profileErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      {profileErrors.map((error, index) => (
                        <p key={index} className="text-red-400 text-sm">{error}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <EditProfileForm
                initialData={{
                  full_name: user?.full_name || '',
                  avatar_url: user?.avatar_url || '',
                  industry: user?.industry || '',
                  experience_level: user?.experience_level || '',
                  business_stage: user?.business_stage || '',
                  country: user?.country || '',
                  state_province: user?.state_province || '',
                  city: user?.city || ''
                }}
                onSubmit={handleEditProfile}
                onCancel={() => handleEditProfileModalToggle(false)}
                loading={profileLoading}
                errors={profileErrors}
                success={profileSuccess}
              />
            </div>
          </Modal>

          {/* Delete Account Modal */}
          <Modal isOpen={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} title="Delete Account">
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-400 font-medium">Warning: This action cannot be undone</h4>
                    <p className="text-red-300 text-sm mt-1">
                      Deleting your account will permanently remove all your data, progress, and certificates.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button variant="outline" onClick={() => setShowDeleteAccount(false)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-500/10"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE'}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
