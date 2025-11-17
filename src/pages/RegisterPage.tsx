import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import ValidationMessage from '../components/ui/ValidationMessage';
import { validateEmail, validatePassword, validatePasswordMatch, validateFullName, validateTopicsOfInterest, getAuthErrorMessage, extractErrorCode } from '../utils/validation';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Briefcase, ArrowLeft, Check, X, Building2, MapPin, Globe, BookOpen, ChevronDown, HelpCircle, ExternalLink } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { signUp, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    education_level: '',
    job_title: '',
    topics_of_interest: [] as string[],
    industry: '',
    experience_level: '',
    business_stage: '',
    country: '',
    state_province: '',
    city: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const educationLevels = [
    'High School',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Other'
  ];

  const availableTopics = [
    'Business & Entrepreneurship',
    'Technology & Programming',
    'Marketing & Sales',
    'Finance & Investment',
    'Leadership & Management',
    'Personal Development',
    'Health & Wellness',
    'Creative Arts',
    'Science & Research',
    'Education & Training'
  ];

  // African market sectors for industry selection
  const industries = [
    'Agriculture & Agribusiness',
    'Technology & Digital Innovation',
    'Financial Services & Fintech',
    'Healthcare & Pharmaceuticals',
    'Manufacturing & Industrial',
    'Energy & Renewable Resources',
    'Tourism & Hospitality',
    'Education & Training',
    'Real Estate & Construction',
    'Transportation & Logistics',
    'Retail & E-commerce',
    'Media & Entertainment',
    'Telecommunications',
    'Mining & Natural Resources',
    'Textiles & Fashion',
    'Food & Beverage',
    'Consulting & Professional Services',
    'Non-profit & Social Enterprise',
    'Other'
  ];

  // Experience levels
  const experienceLevels = [
    'Entry Level (0-2 years)',
    'Mid-Level (3-7 years)',
    'Senior (8+ years)'
  ];

  // Business stages
  const businessStages = [
    'Idea Stage',
    'Startup',
    'Growth Stage',
    'Established Business'
  ];

  // African countries
  const countries = [
    'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda',
    'Morocco', 'Algeria', 'Egypt', 'Sudan', 'Angola', 'Mozambique', 'Zambia',
    'Zimbabwe', 'Botswana', 'Namibia', 'Malawi', 'Rwanda', 'Burundi', 'Somalia',
    'Djibouti', 'Eritrea', 'Comoros', 'Seychelles', 'Mauritius', 'Madagascar',
    'Cameroon', 'Chad', 'Central African Republic', 'Congo', 'DR Congo',
    'Gabon', 'Equatorial Guinea', 'São Tomé and Príncipe', 'Benin', 'Burkina Faso',
    'Cape Verde', 'Côte d\'Ivoire', 'Gambia', 'Guinea', 'Guinea-Bissau',
    'Liberia', 'Mali', 'Mauritania', 'Niger', 'Senegal', 'Sierra Leone',
    'Togo', 'Lesotho', 'Eswatini', 'Other'
  ];

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
  };

  // Real-time validation
  const validateField = (field: string, value: any) => {
    let validationResult;

    switch (field) {
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'password':
        validationResult = validatePassword(value);
        break;
      case 'confirmPassword':
        validationResult = validatePasswordMatch(formData.password, value);
        break;
      case 'full_name':
        validationResult = validateFullName(value);
        break;
      case 'topics_of_interest':
        validationResult = validateTopicsOfInterest(value);
        break;
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

  // Enhanced error handling
  useEffect(() => {
    if (error) {
      const errorCode = extractErrorCode(error);
      const enhancedMessage = getAuthErrorMessage(errorCode, error);
      setError(enhancedMessage);
    }
  }, [error]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleTopicToggle = (topic: string) => {
    const newTopics = formData.topics_of_interest.includes(topic)
      ? formData.topics_of_interest.filter(t => t !== topic)
      : [...formData.topics_of_interest, topic];

    setFormData(prev => ({
      ...prev,
      topics_of_interest: newTopics
    }));

    // Validate topics after change
    validateField('topics_of_interest', newTopics);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    // Clear previous errors
    setError('');
    setSuccess('');
    setValidationErrors({});

    // Validate all fields
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);
    validateField('full_name', formData.full_name);
    validateField('topics_of_interest', formData.topics_of_interest);

    // Check if there are any validation errors
    const hasErrors = Object.keys(validationErrors).length > 0;

    if (hasErrors) {
      return false;
    }

    // Additional checks
    if (passwordStrength < 2) {
      setError('Password is too weak. Please choose a stronger password.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;

      // Call server-side API to create Firebase user and Firestore document
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(err.error || 'Registration failed');
      }

      setSuccess('Account created successfully! Please check your email for verification if enabled.');

      // Redirect to login after short delay
      setTimeout(() => router.push('/login'), 1200);
    } catch (error: any) {
      console.log('Registration error:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">FA</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Join Forward Africa
          </h2>
          <p className="text-gray-400">
            Start your learning journey today
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    className={`block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.full_name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, full_name: e.target.value }));
                      validateField('full_name', e.target.value);
                    }}
                    onBlur={(e) => validateField('full_name', e.target.value)}
                  />
                </div>
                {validationErrors.full_name && (
                  <ValidationMessage
                    message={validationErrors.full_name}
                    type="error"
                    className="mt-1"
                  />
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
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
            </div>

            {/* Password Fields - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`block w-full pl-10 pr-12 py-2.5 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => {
                      handlePasswordChange(e.target.value);
                      validateField('password', e.target.value);
                    }}
                    onBlur={(e) => validateField('password', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Strength:</span>
                      <span className={`font-medium ${passwordStrength >= 4 ? 'text-green-400' : passwordStrength >= 3 ? 'text-blue-400' : passwordStrength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`block w-full pl-10 pr-12 py-2.5 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.confirmPassword ? 'border-red-500' :
                      formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500' : 'border-gray-600'
                    }`}
                    placeholder="Confirm your password"
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
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
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
                    message={formData.password === formData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                    type={formData.password === formData.confirmPassword ? "success" : "error"}
                    className="mt-1"
                  />
                )}
              </div>
            </div>

            {/* Professional Information - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Education Level */}
              <div className="space-y-1">
                <label htmlFor="education_level" className="block text-sm font-medium text-gray-300">
                  Education Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="education_level"
                    name="education_level"
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    value={formData.education_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, education_level: e.target.value }))}
                  >
                    <option value="">Select education level</option>
                    {educationLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Job Title */}
              <div className="space-y-1">
                <label htmlFor="job_title" className="block text-sm font-medium text-gray-300">
                  Job Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="job_title"
                    name="job_title"
                    type="text"
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your job title"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Business Information - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Industry */}
              <div className="space-y-1">
                <label htmlFor="industry" className="block text-sm font-medium text-gray-300">
                  Industry
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="industry"
                    name="industry"
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">Select industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-1">
                <label htmlFor="experience_level" className="block text-sm font-medium text-gray-300">
                  Experience Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="experience_level"
                    name="experience_level"
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    value={formData.experience_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_level: e.target.value }))}
                  >
                    <option value="">Select experience</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Business Stage */}
              <div className="space-y-1">
                <label htmlFor="business_stage" className="block text-sm font-medium text-gray-300">
                  Business Stage
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    id="business_stage"
                    name="business_stage"
                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    value={formData.business_stage}
                    onChange={(e) => setFormData(prev => ({ ...prev, business_stage: e.target.value }))}
                  >
                    <option value="">Select stage</option>
                    {businessStages.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Geographic Location - 3 columns */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Geographic Location
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <div className="space-y-1">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-400">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="country"
                      name="country"
                      className="block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* State/Province */}
                <div className="space-y-1">
                  <label htmlFor="state_province" className="block text-sm font-medium text-gray-400">
                    State/Province
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="state_province"
                      name="state_province"
                      type="text"
                      className="block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter state/province"
                      value={formData.state_province}
                      onChange={(e) => setFormData(prev => ({ ...prev, state_province: e.target.value }))}
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label htmlFor="city" className="block text-sm font-medium text-gray-400">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className="block w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Topics of Interest - Custom Multi-select Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Topics of Interest * (Select at least one)
              </label>
              <div className="relative">
                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setShowTopicsDropdown(!showTopicsDropdown)}
                  className="w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                >
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-gray-400 mr-3" />
                    <span className={formData.topics_of_interest.length > 0 ? 'text-white' : 'text-gray-400'}>
                      {formData.topics_of_interest.length > 0
                        ? `${formData.topics_of_interest.length} topic(s) selected`
                        : 'Select topics of interest'
                      }
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showTopicsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options */}
                {showTopicsDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {availableTopics.map((topic) => (
                      <label
                        key={topic}
                        className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                      >
                        <input
                          type="checkbox"
                          checked={formData.topics_of_interest.includes(topic)}
                          onChange={() => handleTopicToggle(topic)}
                          className="mr-3 h-4 w-4 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <span className="text-white text-sm">{topic}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Topics Display */}
              {formData.topics_of_interest.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">Selected topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {formData.topics_of_interest.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-red-600/20 text-red-400 border border-red-500"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => handleTopicToggle(topic)}
                          className="ml-1 text-red-400 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics Validation Message */}
              {validationErrors.topics_of_interest && (
                <ValidationMessage
                  message={validationErrors.topics_of_interest}
                  type="error"
                  className="mt-1"
                />
              )}
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
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <span>Create Account</span>
              )}
            </Button>
          </form>

          {/* Helpful Links */}
          <div className="mt-6 space-y-4">
            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
                >
                  Sign in here
                </button>
              </p>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <p className="text-gray-400">
                Forgot your password?{' '}
                <button
                  onClick={() => router.push('/forgot-password')}
                  className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
                >
                  Reset it here
                </button>
              </p>
            </div>

            {/* Help Section */}
            <div className="text-center">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="inline-flex items-center space-x-1 text-gray-400 hover:text-gray-300 transition-colors duration-200"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm">Need help?</span>
              </button>
            </div>

            {/* Help Content */}
            {showHelp && (
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Registration Tips:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Use a strong password with at least 6 characters</li>
                  <li>• Select topics that interest you for personalized content</li>
                  <li>• All fields marked with * are required</li>
                  <li>• If you already have an account, try logging in instead</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
