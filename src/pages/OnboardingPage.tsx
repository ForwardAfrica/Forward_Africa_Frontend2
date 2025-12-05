import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Check, GraduationCap, Briefcase, MapPin, Globe, Users, BookOpen, Target, TrendingUp, Award, Zap, ChevronLeft, ArrowRight, Star } from 'lucide-react';
import Layout from '../components/layout/Layout';
import SuccessToast from '../components/ui/SuccessToast';
import { useProfileCompletion } from '../hooks/useProfileCompletion';

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { resetPromptCount } = useProfileCompletion();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
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
  const [particleStyles, setParticleStyles] = useState<Array<{
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  // Generate particle styles only on client side to prevent hydration issues
  useEffect(() => {
    const styles = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`
    }));
    setParticleStyles(styles);
  }, []);

  const handleTopicToggle = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      topics_of_interest: prev.topics_of_interest.includes(topicId)
        ? prev.topics_of_interest.filter(id => id !== topicId)
        : [...prev.topics_of_interest, topicId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      console.log('🔄 Completing onboarding with data:', {
        ...formData,
        onboarding_completed: true
      });
      await updateProfile({
        ...formData,
        onboarding_completed: true
      });
      console.log('✅ Onboarding completed successfully');

      // Reset the profile completion prompt count
      resetPromptCount();

      setShowSuccess(true);
      setShowToast(true);

      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        router.push('/courses');
      }, 2000);
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      console.log('🔄 Skipping onboarding');
      await updateProfile({
        onboarding_completed: true
      });
      console.log('✅ Onboarding skipped successfully');

      // Reset the profile completion prompt count
      resetPromptCount();

      setShowSuccess(true);
      setShowToast(true);

      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        router.push('/courses');
      }, 2000);
    } catch (error) {
      console.error('❌ Failed to skip onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.education_level !== '';
      case 2:
        return formData.job_title !== '' && formData.topics_of_interest.length > 0;
      case 3:
        return formData.industry !== '' && formData.experience_level !== '';
      default:
        return false;
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return GraduationCap;
      case 2: return Briefcase;
      case 3: return Target;
      default: return GraduationCap;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Tell us about your education';
      case 2: return 'What do you do?';
      case 3: return 'What are your goals?';
      default: return '';
    }
  };

  const getStepSubtitle = (step: number) => {
    switch (step) {
      case 1: return 'Help us personalize your learning experience';
      case 2: return 'We\'ll recommend relevant courses and content';
      case 3: return 'Let\'s tailor your learning journey';
      default: return '';
    }
  };

  // Education levels
  const educationLevels = [
    { id: 'high-school', label: 'High School', description: 'Currently in or completed high school' },
    { id: 'bachelor', label: 'Bachelor\'s Degree', description: 'Currently pursuing or completed bachelor\'s degree' },
    { id: 'master', label: 'Master\'s Degree', description: 'Currently pursuing or completed master\'s degree' },
    { id: 'phd', label: 'PhD/Doctorate', description: 'Currently pursuing or completed doctoral degree' },
    { id: 'other', label: 'Other', description: 'Other educational background' }
  ];

  // Job titles
  const jobTitles = [
    { id: 'student', label: 'Student', description: 'Currently studying' },
    { id: 'entry_level', label: 'Entry Level', description: 'Just starting my career' },
    { id: 'mid_level', label: 'Mid Level', description: 'Some experience in my field' },
    { id: 'senior', label: 'Senior Level', description: 'Experienced professional' },
    { id: 'manager', label: 'Manager', description: 'Managing teams or projects' },
    { id: 'executive', label: 'Executive', description: 'C-level or senior leadership' },
    { id: 'entrepreneur', label: 'Entrepreneur', description: 'Running my own business' },
    { id: 'freelancer', label: 'Freelancer', description: 'Working independently' }
  ];

  // Topics of interest
  const topicsOfInterest = [
    { id: 'business', label: 'Business & Entrepreneurship', icon: Briefcase },
    { id: 'technology', label: 'Technology & Innovation', icon: Zap },
    { id: 'leadership', label: 'Leadership & Management', icon: Users },
    { id: 'marketing', label: 'Marketing & Sales', icon: TrendingUp },
    { id: 'finance', label: 'Finance & Investment', icon: Award },
    { id: 'education', label: 'Education & Training', icon: BookOpen },
    { id: 'healthcare', label: 'Healthcare & Wellness', icon: Target },
    { id: 'sustainability', label: 'Sustainability & Environment', icon: Globe }
  ];

  // Industries
  const industries = [
    { id: 'technology', label: 'Technology' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'finance', label: 'Finance' },
    { id: 'education', label: 'Education' },
    { id: 'retail', label: 'Retail' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'consulting', label: 'Consulting' },
    { id: 'non_profit', label: 'Non-Profit' },
    { id: 'government', label: 'Government' },
    { id: 'other', label: 'Other' }
  ];

  // Experience levels
  const experienceLevels = [
    { id: 'beginner', label: 'Beginner (0-2 years)' },
    { id: 'intermediate', label: 'Intermediate (3-5 years)' },
    { id: 'advanced', label: 'Advanced (6-10 years)' },
    { id: 'expert', label: 'Expert (10+ years)' }
  ];

  // Business stages
  const businessStages = [
    { id: 'idea', label: 'Just an idea' },
    { id: 'startup', label: 'Early startup' },
    { id: 'growing', label: 'Growing business' },
    { id: 'established', label: 'Established business' },
    { id: 'scaling', label: 'Scaling up' }
  ];

  // Countries
  const countries = [
    { id: 'nigeria', label: 'Nigeria' },
    { id: 'ghana', label: 'Ghana' },
    { id: 'kenya', label: 'Kenya' },
    { id: 'south_africa', label: 'South Africa' },
    { id: 'ethiopia', label: 'Ethiopia' },
    { id: 'tanzania', label: 'Tanzania' },
    { id: 'uganda', label: 'Uganda' },
    { id: 'other', label: 'Other' }
  ];

  return (
    <Layout>
      <SuccessToast
        message="Profile completed successfully!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
      <div className="min-h-screen bg-brand-background-gradient text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(93,88,242,0.1),transparent_50%)]" />

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {particleStyles.map((style, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-brand-deepPurple/30 rounded-full animate-pulse"
              style={style}
            />
          ))}
        </div>

        {/* Onboarding Header */}
        <div className="relative z-10 px-6 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-brand-deepPurple font-bold text-2xl tracking-tight">FORWARD</span>
              <span className="text-white font-bold text-2xl tracking-tight">AFRICA</span>
            </div>
            <div className="text-gray-400 text-sm">
              Step {currentStep} of 3
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl w-full">
            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((step) => {
                  const Icon = getStepIcon(step);
                  const isActive = step === currentStep;
                  const isCompleted = step < currentStep;

                  return (
                    <React.Fragment key={step}>
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-red-500 bg-red-500 text-white'
                          : isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-600 bg-gray-800 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      {step < 3 && (
                        <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                          step < currentStep ? 'bg-green-500' : 'bg-gray-600'
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {getStepTitle(currentStep)}
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  {getStepSubtitle(currentStep)}
                </p>
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800">
              {currentStep === 1 && (
                <div className="space-y-4">
                  {educationLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setFormData(prev => ({ ...prev, education_level: level.id }))}
                      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                        formData.education_level === level.id
                          ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-lg font-semibold mb-1 transition-colors ${
                            formData.education_level === level.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                          }`}>
                            {level.label}
                          </h3>
                          <p className="text-gray-400 text-sm">{level.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                          formData.education_level === level.id
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-600 group-hover:border-gray-500'
                        }`}>
                          {formData.education_level === level.id && (
                            <Check className="h-3 w-3 text-white m-0.5" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  {/* Job Title Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">What's your current role?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobTitles.map((job) => (
                        <button
                          key={job.id}
                          onClick={() => setFormData(prev => ({ ...prev, job_title: job.id }))}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                            formData.job_title === job.id
                              ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                          }`}
                        >
                          <h4 className={`font-semibold mb-1 transition-colors ${
                            formData.job_title === job.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                          }`}>
                            {job.label}
                          </h4>
                          <p className="text-gray-400 text-sm">{job.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topics of Interest */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">What interests you most?</h3>
                    <p className="text-gray-400 text-sm mb-6">Select all that apply</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {topicsOfInterest.map((topic) => {
                        const isSelected = formData.topics_of_interest.includes(topic.id);
                        const Icon = topic.icon;

                        return (
                          <button
                            key={topic.id}
                            onClick={() => handleTopicToggle(topic.id)}
                            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                              isSelected
                                ? 'border-brand-deepPurple bg-brand-gradient/20 shadow-lg shadow-brand-glow-purple'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Icon className="h-6 w-6 text-red-500" />
                              <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                                isSelected
                                  ? 'border-red-500 bg-red-500'
                                  : 'border-gray-600 group-hover:border-gray-500'
                              }`}>
                                {isSelected && (
                                  <Check className="h-3 w-3 text-white m-0.5" />
                                )}
                              </div>
                            </div>
                            <h3 className={`font-semibold transition-colors ${
                              isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                            }`}>
                              {topic.label}
                            </h3>
                          </button>
                        );
                      })}
                    </div>

                    {formData.topics_of_interest.length > 0 && (
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">
                          {formData.topics_of_interest.length} topic{formData.topics_of_interest.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  {/* Industry Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">What industry are you in?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {industries.map((industry) => (
                        <button
                          key={industry.id}
                          onClick={() => setFormData(prev => ({ ...prev, industry: industry.id }))}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                            formData.industry === industry.id
                              ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                          }`}
                        >
                          <h4 className={`font-semibold transition-colors ${
                            formData.industry === industry.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                          }`}>
                            {industry.label}
                          </h4>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">What's your experience level?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setFormData(prev => ({ ...prev, experience_level: level.id }))}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                            formData.experience_level === level.id
                              ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                          }`}
                        >
                          <h4 className={`font-semibold transition-colors ${
                            formData.experience_level === level.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                          }`}>
                            {level.label}
                          </h4>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Business Stage (if applicable) */}
                  {formData.job_title === 'entrepreneur' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">What stage is your business in?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {businessStages.map((stage) => (
                          <button
                            key={stage.id}
                            onClick={() => setFormData(prev => ({ ...prev, business_stage: stage.id }))}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                              formData.business_stage === stage.id
                                ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                            }`}
                          >
                            <h4 className={`font-semibold transition-colors ${
                              formData.business_stage === stage.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                            }`}>
                              {stage.label}
                            </h4>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Where are you located?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {countries.map((country) => (
                        <button
                          key={country.id}
                          onClick={() => setFormData(prev => ({ ...prev, country: country.id }))}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                            formData.country === country.id
                              ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
                          }`}
                        >
                          <h4 className={`font-semibold transition-colors ${
                            formData.country === country.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                          }`}>
                            {country.label}
                          </h4>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-12">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    currentStep === 1
                      ? 'invisible'
                      : 'text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </button>

                <div className="flex-1 flex justify-center">
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          step === currentStep
                            ? 'bg-red-500 w-8'
                            : step < currentStep
                            ? 'bg-green-500'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Skip button - always visible */}
                  <button
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                      isSubmitting
                        ? 'text-gray-500 border-gray-700 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                        Skipping...
                      </>
                    ) : (
                      'Skip for now'
                    )}
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                      className={`flex items-center px-6 py-2 rounded-lg transition-all ${
                        canProceed() && !isSubmitting
                          ? 'bg-[#ef4444] hover:bg-[#dc2626] shadow-lg'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleComplete}
                      disabled={!canProceed() || isSubmitting}
                      className={`flex items-center px-6 py-2 rounded-lg transition-all ${
                        canProceed() && !isSubmitting
                          ? 'bg-[#ef4444] hover:bg-[#dc2626] shadow-lg'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <Star className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Success Message Overlay */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-700">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full inline-flex mb-6">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Profile Completed Successfully!
              </h3>
              <p className="text-gray-300 mb-6">
                Your profile has been updated and you're all set to start your learning journey.
              </p>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <span className="ml-3 text-green-400">Redirecting to home...</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="relative z-10 px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500 text-sm">
              Your information helps us create a personalized learning experience
            </p>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default OnboardingPage;