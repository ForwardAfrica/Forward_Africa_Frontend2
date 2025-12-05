import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/ui/Button';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import ValidationMessage from '../components/ui/ValidationMessage';
import { validateEmail } from '../utils/validation';
import { Mail, ArrowLeft, Check } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    setValidationErrors({});

    // Validate email
    validateField('email', email);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setSuccess(true);
      console.log('Reset code sent:', data.resetCode); // Remove this in production
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-background-gradient">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-4">
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
            <span className="text-white text-2xl font-bold">FA</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-400">
            Enter your email to receive a reset code
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
                    <span>Sending...</span>
                  </div>
                ) : (
                  <span>Send Reset Code</span>
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
                  Reset Code Sent!
                </h3>
                <p className="text-gray-400 mb-4">
                  We've sent a 6-digit reset code to your email address.
                </p>
                <p className="text-sm text-gray-500 bg-gray-700/50 p-3 rounded-lg">
                  <strong>Development Note:</strong> Check the console for the reset code.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/reset-password')}
                  variant="primary"
                  size="lg"
                  className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  Enter Reset Code
                </Button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;