import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Brain, Users, TrendingUp, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import Image from 'next/image';
import Footer from '../components/layout/Footer';

import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    // Navigate to the main login page for better user experience
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-background">
        {/* Simple Header with Logo and Login */}
        <header className="fixed top-0 w-full z-50">
          <div className="bg-brand-background/90 backdrop-blur-sm border-b border-white/10 mb-10">
            <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-24 md:h-28">
                {/* Logo */}
                <Link href="/home" className="flex items-center flex-shrink-0">
                  <Image
                    src="/images/chosen.png"
                    alt="Forward Africa Logo"
                    width={200}
                    height={200}
                    className="w-32 h-32 md:w-40 md:h-40 object-contain"
                    priority
                  />
                </Link>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 hover:shadow-lg px-4 py-2 text-sm font-medium rounded-md transition-transform hover:scale-[1.02]"
                >
                  Login
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-40 pb-16">
            {/* Hero Section */}
            <div className="text-center mb-20 md:mb-24 py-12 md:py-16">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8">
              Get Smarter, Faster
              </h1>
              <p className="text-xl md:text-3xl lg:text-4xl text-brand-primary font-semibold mb-8 md:mb-10">
              Acquire the Skills to Move Forward.
              </p>

              <div className="mb-8 md:mb-10">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="group"
                >
                  {isSigningIn ? 'Preparing...' : 'Start Learning Today'}
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto">
              We have built to Empower Africa's Workforce, Advance Careers and to Move Africa Forward.
              </p>

            </div>

            {/* Membership Value Section */}
            <section className="bg-brand-surface/80 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-sm mb-20 md:mb-24">
              <div className="text-center mb-12 md:mb-16">
                <p className="text-sm md:text-base uppercase tracking-[0.2em] text-brand-primary mb-4 md:mb-5">
                  A Platform Engineered for Growth and Mastery
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  A Forward Membership Gets You
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <Brain className="h-7 w-7 text-brand-primary" />
                    <h3 className="text-white text-xl font-semibold">Expert Instructors</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Learn directly from the best business minds and proven experts across Africa,
                    ensuring relevance, credibility, and local context for every lesson.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-7 w-7 text-brand-primary" />
                    <h3 className="text-white text-xl font-semibold">Courses</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    High-quality, practical, on-demand business education covering essential topics.
                    Complete courses to earn verifiable FWD App Certifications that elevate your professional profile.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <Globe className="h-7 w-7 text-brand-primary" />
                    <h3 className="text-white text-xl font-semibold">Akira</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Our revolutionary AI assistant and coach delivers crucial market data, regulatory insights,
                    and cultural nuances across Africa, acting as your trusted, all-in-one local expert.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <Users className="h-7 w-7 text-brand-primary" />
                    <h3 className="text-white text-xl font-semibold">Community</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    A vibrant network where professionals and entrepreneurs connect, share experiences,
                    and collaborate to build the high-value support systems needed for scale.
                  </p>
                </div>
              </div>
            </section>

            {/* Reasons Section */}
            <div className="py-12 md:py-16">
              <p className="text-center text-sm md:text-base uppercase tracking-[0.3em] text-brand-primary mb-8 md:mb-10">
                More Reasons to Join
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[
                  { value: '10+', label: 'Certified Core Courses' },
                  { value: '50+', label: 'Hours of Expert Video Content for immediate, practical learning' },
                  { value: '54+', label: 'African Countries Covered by Afrisage Data for unmatched context' },
                  { value: '5+', label: 'Industry-Specific Forums for instant networking access' },
                ].map((item) => (
                  <div
                    key={item.value}
                    className="bg-brand-surface-muted/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 text-center"
                  >
                    <div className="text-4xl font-extrabold text-brand-primary mb-3">{item.value}</div>
                    <div className="text-gray-300 text-sm leading-relaxed">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Mission Section */}
        <section className="relative z-10 bg-brand-background/90 backdrop-blur-sm py-16 md:py-24 lg:py-32">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20 lg:mb-24 py-8 md:py-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8">Our Mission</h2>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 md:mb-10">
              Expert Education to build the African Workforce, for precise advancement strategies of careers and Africa.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="group"
              >
                {isSigningIn ? 'Joining...' : 'Join The Movement. Master Your Craft, Move Forward.'}
                <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Precision Learning Section */}
            <div className="bg-brand-surface/70 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8">
                Precision-Engineered Learning for African Success.
              </h3>
              <p className="text-lg md:text-xl text-gray-300 mb-10 md:mb-12 max-w-4xl mx-auto">
                We believe the future of Africa is built by masters of their craft. FWD App is designed to drive that growth,
                providing accessible, actionable knowledge that delivers measurable results for professionals, entrepreneurs,
                and the organizations powering Africa's workforce.
              </p>
              <div className="space-y-4 md:space-y-5">
                {[
                  {
                    title: 'Context-First Curriculum',
                    description:
                      'Practical, results-driven training rooted in African economic, regulatory, and cultural realities with strategies that work here.',
                  },
                  {
                    title: 'Master Future-Proof Skills & Earn Credentials',
                    description:
                      'Build the leadership, technology, finance, and professional excellence needed to navigate a dynamic landscape and graduate with a verifiable Forward Africa Certification.',
                  },
                  {
                    title: 'Tangible Results, Guaranteed',
                    description:
                      'Apply your learning immediately to daily work and ventures, ensuring measurable impact on career trajectory and business growth.',
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="bg-brand-surface-muted/60 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-white/5 transition-colors"
                    >
                      <h4 className="text-white text-xl font-semibold pr-4">{item.title}</h4>
                      <ChevronDown
                        className={`h-5 w-5 text-brand-primary flex-shrink-0 transition-transform duration-300 ${
                          expandedCard === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedCard === index && (
                      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                        <p className="text-gray-300 leading-relaxed text-base md:text-lg">{item.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-10 md:mt-12 lg:mt-16 text-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="group"
                >
                  {isSigningIn ? 'Investing...' : 'Invest in your Career. Master Your Craft, Move Forward.'}
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative z-10 bg-gradient-to-t from-brand-background to-transparent py-16 md:py-24 lg:py-32">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8">
              Join Us in Shaping Africa's Future
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8 md:mb-10">
              Be part of a movement that's empowering entrepreneurs to build thriving,
              sustainable businesses that contribute to a prosperous African future.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="group"
            >
              {isSigningIn ? 'Starting...' : 'Start Learning Today'}
              <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <div className="relative z-20">
          <Footer />
        </div>
      </div>
  );
};

export default LandingPage;
