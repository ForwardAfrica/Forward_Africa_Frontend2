import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/ui/Button';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import ValidationMessage from '../components/ui/ValidationMessage';
import { validateEmail, validatePassword } from '../utils/validation';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    let validationResult;

    switch (field) {
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'newPassword':
        validationResult = validatePassword(value);
        break;
      case 'confirmPassword':
        if (value !== formData.newPassword) {
          setValidationErrors(prev => ({ ...prev, [field]: 'Passwords do not match' }));
          return;
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
          return;
        }
      default:
        return;
    }

    if (!validationResult.isValid) {
      setValidationErrors(prev => ({ ...prev, [field]: validationResult.message }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate all fields
    validateField('email', formData.email);
    validateField('newPassword', formData.newPassword);
    validateField('confirmPassword', formData.confirmPassword);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify reset code
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          resetCode: formData.resetCode
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Failed to verify reset code');
      }

      // Step 2: Reset password with token
      const resetResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken: verifyData.resetToken,
          newPassword: formData.newPassword
        }),
      });

      const resetData = await resetResponse.json();

      if (!resetResponse.ok) {
        throw new Error(resetData.error || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-background/90">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-4">
          <button
            onClick={() => router.push('/forgot-password')}
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Forgot Password</span>
          </button>
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
            <span className="text-white text-2xl font-bold">FA</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Reset Password
          </h2>
          <p className="text-gray-400">
            Enter your reset code and new password
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      validateField('email', e.target.value);
                    }}
                    onBlur={(e) => validateField('email', e.target.value)}
                  />
                </div>
                {validationErrors.email && (
                  <ValidationMessage
                    message={validationErrors.email}
                    type="error"
                    className="mt-1"
                  />
                )}
              </div>

              {/* Reset Code Field */}
              <div className="space-y-2">
                <label htmlFor="resetCode" className="block text-sm font-medium text-gray-300">
                  Reset Code
                </label>
                <input
                  id="resetCode"
                  name="resetCode"
                  type="text"
                  required
                  className="block w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter 6-digit code"
                  value={formData.resetCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, resetCode: e.target.value }))}
                  maxLength={6}
                />
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`block w-full pl-10 pr-12 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.newPassword ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, newPassword: e.target.value }));
                      validateField('newPassword', e.target.value);
                    }}
                    onBlur={(e) => validateField('newPassword', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {validationErrors.newPassword && (
                  <ValidationMessage
                    message={validationErrors.newPassword}
                    type="error"
                    className="mt-1"
                  />
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`block w-full pl-10 pr-12 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.confirmPassword ? 'border-red-500' :
                      formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'border-green-500' : 'border-gray-600'
                    }`}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      validateField('confirmPassword', e.target.value);
                    }}
                    onBlur={(e) => validateField('confirmPassword', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <ValidationMessage
                    message={validationErrors.confirmPassword}
                    type="error"
                    className="mt-1"
                  />
                )}
                {!validationErrors.confirmPassword && formData.confirmPassword && (
                  <ValidationMessage
                    message={formData.newPassword === formData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                    type={formData.newPassword === formData.confirmPassword ? "success" : "error"}
                    className="mt-1"
                  />
                )}
              </div>

              {/* Error Message */}
              <ErrorDisplay
                error={error}
                type="error"
                onClose={() => setError('')}
                className="mb-4"
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Resetting...</span>
                  </div>
                ) : (
                  <span>Reset Password</span>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Password Reset Successfully!
                </h3>
                <p className="text-gray-400 mb-4">
                  Your password has been updated. You can now log in with your new password.
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                variant="primary"
                size="lg"
                className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;