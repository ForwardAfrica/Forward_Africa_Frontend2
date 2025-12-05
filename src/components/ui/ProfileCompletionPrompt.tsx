import React, { useState } from 'react';
import { useNavigate } from '../../lib/router';
import { User, X, ArrowRight, Star } from 'lucide-react';
import Button from './Button';
import { useProfileCompletion } from '../../hooks/useProfileCompletion';

interface ProfileCompletionPromptProps {
  user: any;
  onDismiss?: () => void;
  variant?: 'banner' | 'modal' | 'card';
}

const ProfileCompletionPrompt: React.FC<ProfileCompletionPromptProps> = ({
  user,
  onDismiss,
  variant = 'banner'
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const {
    shouldPrompt,
    completionPercentage,
    missingFields,
    recordPrompt,
    resetPromptCount
  } = useProfileCompletion();

  const handleCompleteProfile = () => {
    recordPrompt(); // Record that user was prompted
    navigate('/onboarding');
  };

  const handleDismiss = () => {
    recordPrompt(); // Record that user was prompted
    setIsVisible(false);
    onDismiss?.();
  };

  // Debug logging
  console.log('🔍 ProfileCompletionPrompt Debug:', {
    isVisible,
    shouldPrompt,
    onboardingCompleted: user?.onboarding_completed,
    user: user ? { id: user.id, email: user.email, onboarding_completed: user.onboarding_completed } : null
  });

  // Don't show if user shouldn't be prompted or if already visible
  if (!isVisible || !shouldPrompt || user?.onboarding_completed) {
    console.log('🔍 ProfileCompletionPrompt: Hiding prompt because:', {
      isVisible: !isVisible,
      shouldPrompt: !shouldPrompt,
      onboardingCompleted: user?.onboarding_completed
    });
    return null;
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Complete your profile</h3>
              <p className="text-blue-100 text-sm">
                Help us personalize your learning experience. {completionPercentage}% complete.
                {missingFields.length > 0 && (
                  <span className="block text-xs mt-1">
                    Missing: {missingFields.slice(0, 2).join(', ')}
                    {missingFields.length > 2 && ` and ${missingFields.length - 2} more`}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={handleCompleteProfile}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <button
              onClick={handleDismiss}
              className="text-white/70 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full inline-flex mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Enhance Your Experience</h3>
            <p className="text-gray-300 mb-4">
              Complete your profile to get personalized course recommendations and track your progress better.
            </p>
            <div className="bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mb-2">
              Profile completion: {completionPercentage}%
            </p>
            {missingFields.length > 0 && (
              <p className="text-xs text-gray-500 mb-6">
                Missing: {missingFields.slice(0, 3).join(', ')}
                {missingFields.length > 3 && ` and ${missingFields.length - 3} more`}
              </p>
            )}
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                variant="primary"
                onClick={handleCompleteProfile}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="bg-brand-gradient p-2 rounded-full">
          <User className="h-4 w-4 text-brand-textLight" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">Complete Your Profile</h4>
          <p className="text-gray-300 text-sm mb-2">
            Get personalized recommendations by completing your profile. {completionPercentage}% done.
          </p>
          {missingFields.length > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              Missing: {missingFields.slice(0, 2).join(', ')}
              {missingFields.length > 2 && ` and ${missingFields.length - 2} more`}
            </p>
          )}
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompleteProfile}
              className=""
            >
              Complete Now
            </Button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionPrompt;