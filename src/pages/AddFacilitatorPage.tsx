import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Phone, Globe, Plus, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate, useSearchParams } from '../lib/router';
import { Instructor } from '../types';
import InstructorImageUpload from '../components/ui/InstructorImageUpload';
import { useInstructorForm } from '../hooks/useInstructorForm';
import { ValidationError, ValidationErrorsList } from '../components/ui/ValidationError';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import Layout from '../components/layout/Layout';

const AddInstructorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editInstructorId = searchParams.get('edit');
  const [newExpertise, setNewExpertise] = useState('');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Handle success and error callbacks
  const handleSuccess = (instructor: Instructor, message?: string) => {
    // Log audit event
    const auditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('adminEmail') || 'Unknown',
      action: editInstructorId ? 'instructor_updated' : 'instructor_created',
      details: `${editInstructorId ? 'Updated' : 'Created'} instructor: ${instructor.name}`,
      ipAddress: '192.168.1.100'
    };

    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.unshift(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000)));

    // Show success message and navigate after a delay
    setTimeout(() => {
      navigate('/admin');
    }, 2000);
  };

  const handleError = (error: string, errorCode?: string) => {
    console.error('Instructor operation failed:', error, errorCode);
  };

  // Use the custom hook for form management
  const {
    formData,
    setFormData,
    isLoading,
    isSubmitting,
    isEditing,
    validationErrors,
    handleSubmit,
    handleReset,
    handleAddExpertise,
    handleRemoveExpertise,
    updateField,
    updateSocialLink,
    lastError,
    lastErrorCode,
    lastSuccess,
    clearErrors,
    clearSuccess,
    hasUnsavedChanges,
    isFormValid
  } = useInstructorForm({
    instructorId: editInstructorId || undefined,
    onSuccess: handleSuccess,
    onError: handleError
  });

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle adding expertise from input
  const handleAddExpertiseFromInput = () => {
    if (newExpertise.trim()) {
      handleAddExpertise(newExpertise);
      setNewExpertise('');
    }
  };

  // Get validation error for a specific field
  const getFieldError = (fieldName: string) => {
    const error = validationErrors.find(err => err.field === fieldName);
    return error?.message;
  };

  // Get general errors (not field-specific)
  const generalErrors = validationErrors.filter(err => err.field === 'general');

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              <span className="text-white text-lg">Loading instructor data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white">
              {isEditing ? 'Edit Instructor' : 'Add New Instructor'}
            </h1>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            {/* Success message */}
            {lastSuccess && (
              <SuccessMessage
                message={lastSuccess}
                onClose={clearSuccess}
                className="mb-6"
              />
            )}

            {/* General validation errors */}
            <ValidationErrorsList
              errors={generalErrors}
              className="mb-6"
              onClose={clearErrors}
            />

            {/* Form Validation Summary */}
            {!isFormValid && validationErrors.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-blue-400 font-medium mb-2">Please complete the following required fields:</h3>
                      <div className="space-y-1">
                        {validationErrors
                          .filter(error => error.severity === 'error')
                          .map((error, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                              <span className="text-blue-300 text-sm">
                                <strong>{error.field.charAt(0).toUpperCase() + error.field.slice(1)}:</strong> {error.message}
                              </span>
                            </div>
                          ))}
                      </div>
                      {validationErrors.filter(error => error.severity === 'warning').length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-500/20">
                          <h4 className="text-blue-400/80 font-medium mb-1 text-sm">Suggestions for improvement:</h4>
                          <div className="space-y-1">
                            {validationErrors
                              .filter(error => error.severity === 'warning')
                              .map((error, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <div className="w-1 h-1 rounded-full bg-blue-400/60"></div>
                                  <span className="text-blue-300/80 text-xs">
                                    <strong>{error.field.charAt(0).toUpperCase() + error.field.slice(1)}:</strong> {error.message}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={clearErrors}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* General error message */}
            {lastError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-red-400 font-medium mb-1">Operation Failed</h3>
                      <p className="text-red-300 text-sm">{lastError}</p>
                      {lastErrorCode && (
                        <p className="text-red-400/60 text-xs mt-1">Error code: {lastErrorCode}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={clearErrors}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${
                      getFieldError('name')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-600 focus:ring-red-500'
                    }`}
                    placeholder="Enter full name"
                    required
                  />
                  <ValidationError error={getFieldError('name')} />
                  {formData.name && !getFieldError('name') && (
                    <div className="flex items-center text-green-400 text-sm mt-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Name looks good!</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Professional Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${
                      getFieldError('title')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-600 focus:ring-red-500'
                    }`}
                    placeholder="e.g., Senior Business Consultant"
                    required
                  />
                  <ValidationError error={getFieldError('title')} />
                  {formData.title && !getFieldError('title') && (
                    <div className="flex items-center text-green-400 text-sm mt-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Title looks good!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${
                      getFieldError('email')
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-600 focus:ring-red-500'
                    }`}
                    placeholder="instructor@example.com"
                    required
                  />
                  <ValidationError error={getFieldError('email')} />
                  {formData.email && !getFieldError('email') && (
                    <div className="flex items-center text-green-400 text-sm mt-1">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Email format is valid!</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="+1 (555) 123-4567"
                  />
                  <ValidationError error={getFieldError('phone')} />
                </div>
              </div>

              {/* Profile Image and Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InstructorImageUpload
                    onImageUpload={(url) => updateField('image', url)}
                    currentImage={formData.image}
                    instructorId={editInstructorId || undefined}
                    label="Profile Image"
                    required
                  />
                </div>
                <ValidationError error={getFieldError('image')} />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => updateField('experience', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="5"
                    required
                  />
                  <ValidationError error={getFieldError('experience')} />
                </div>
              </div>

              {/* Biography */}
                          <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Professional Biography <span className="text-red-400">*</span>
                </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter professional biography and background..."
                required
              />
              <ValidationError error={getFieldError('bio')} />
            </div>

            {/* Areas of Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Areas of Expertise
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertiseFromInput())}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Business Strategy, Leadership"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddExpertiseFromInput}
                  disabled={!newExpertise.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.expertise.map((expertise, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30"
                    >
                      {expertise}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(expertise)}
                        className="ml-2 hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Social Links (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter Profile
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Personal Website
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => updateSocialLink('website', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Form Status */}
            <div className="pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isFormValid ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <span className="text-sm text-gray-300">
                      {isFormValid ? 'Form is ready to submit' : 'Please review the form below'}
                    </span>
                  </div>
                  {hasUnsavedChanges && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-orange-400">Unsaved changes</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {validationErrors.filter(e => e.severity === 'error').length} required fields, {validationErrors.filter(e => e.severity === 'warning').length} suggestions
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <div className="relative">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className={`flex items-center ${!isFormValid ? 'bg-[#ef4444] hover:bg-[#dc2626]' : ''}`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting
                      ? 'Saving...'
                      : !isFormValid
                        ? 'Submit (Review Required)'
                        : (isEditing ? 'Update Instructor' : 'Add Instructor')
                    }
                  </Button>
                  {!isFormValid && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md shadow-lg border border-gray-700 max-w-xs">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 text-blue-400 flex-shrink-0" />
                        <span>Click to see what needs to be completed</span>
                      </div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default AddInstructorPage;
