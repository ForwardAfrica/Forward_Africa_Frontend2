import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import ValidationMessage from '../components/ui/ValidationMessage';
import { validateEmail, getAuthErrorMessage, extractErrorCode } from '../utils/validation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, HelpCircle, ExternalLink } from 'lucide-react';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { signIn, error: authError, clearError, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState(false);

  // Use auth error if available, otherwise use local error
  const displayError = authError || error;

  // Enhanced error handling
  useEffect(() => {
    if (displayError) {
      const errorCode = extractErrorCode(displayError);
      const enhancedMessage = getAuthErrorMessage(errorCode, displayError);
      setError(enhancedMessage);
    }
  }, [displayError]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Real-time validation
  const validateField = (field: string, value: string) => {
    if (field === 'email') {
      const validationResult = validateEmail(value);
      if (!validationResult.isValid) {
        setValidationErrors(prev => ({ ...prev, [field]: validationResult.message }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    clearError(); // Clear any existing auth errors
    setValidationErrors({});

    // Validate fields
    validateField('email', email);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await signIn({ email, password });
      setSuccess('Login successful! Redirecting...');
      // AuthContext will handle the redirect automatically when user is set
    } catch (error) {
      // Error is already handled in AuthContext
      console.log('Login error caught in component:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-gradient">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mb-4 shadow-brand-glow">
            <span className="text-white text-2xl font-bold">FA</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-200">
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-brand-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-brand-glow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-brand-primary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full pl-10 pr-4 py-3 bg-brand-surface-muted/70 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 ${
                    validationErrors.email ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
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

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-brand-primary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-12 py-3 bg-brand-surface-muted/70 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Success Message */}
            <ErrorDisplay
              error={success}
              type="success"
              onClose={() => setSuccess('')}
              className="mb-4"
            />

            {/* Error Message */}
            <ErrorDisplay
              error={displayError}
              type="error"
              onClose={() => {
                setError('');
                clearError();
              }}
              className="mb-4"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Demo Accounts */}
        <div className="mt-8 p-4 bg-brand-surface-muted/40 rounded-xl border border-white/10">
          {/* <p className="text-sm font-medium text-gray-200 mb-3 text-center">
              Demo Accounts
            </p> */}
          {/* <div className="space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Admin:</span>
                <span>admin@forwardafrica.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span>User:</span>
                <span>john.doe@example.com / password123</span>
              </div>
              <div className="flex justify-between">
                <span>Manager:</span>
                <span>jane.smith@example.com / password123</span>
              </div>
            </div> */}
          </div>

          {/* Helpful Links */}
          <div className="mt-6 space-y-4">
            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-brand-primary hover:text-brand-primary/80 font-medium transition-colors duration-200"
                >
                  Create one now
                </button>
              </p>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <p className="text-gray-300">
                Forgot your password?{' '}
                <button
                  onClick={() => router.push('/forgot-password')}
                  className="text-brand-primary hover:text-brand-primary/80 font-medium transition-colors duration-200"
                >
                  Reset it here
                </button>
              </p>
            </div>

            {/* Help Section */}
            <div className="text-center">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="inline-flex items-center space-x-1 text-gray-400 hover:text-gray-200 transition-colors duration-200"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm">Need help?</span>
              </button>
            </div>

            {/* Help Content */}
            {showHelp && (
              <div className="bg-brand-surface-muted/40 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-medium text-gray-200 mb-2">Login Tips:</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Make sure your email address is correct</li>
                  <li>• Check that your password is entered correctly</li>
                  <li>• If you forgot your password, use the reset link above</li>
                  <li>• If you don't have an account, create one using the link above</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
