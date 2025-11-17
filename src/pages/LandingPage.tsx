import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronRight, Brain, Users, TrendingUp, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import Image from 'next/image';
import Footer from '../components/layout/Footer';

import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
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
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/home" className="flex items-center flex-shrink-0">
                  <div className="flex items-center">
                    <Image src="/images/chosen.png" alt="Forward Africa Logo" width={32} height={32} className="mr-3" />
                    <span className="text-brand-primary font-bold text-xl lg:text-2xl tracking-tight">FORWARD</span>
                    <span className="text-white font-bold text-xl lg:text-2xl tracking-tight">AFRICA</span>
                  </div>
                </Link>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="text-white bg-brand-gradient hover:shadow-brand-glow px-4 py-2 text-sm font-medium rounded-md transition-transform hover:scale-[1.02]"
                >
                  Login
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Master Your Craft, Move Forward
              </h1>
              <p className="text-xl md:text-3xl text-brand-primary font-semibold mb-6">
                Acquire the Skills for Growth.
              </p>
              <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mb-4">
                We believe in the boundless potential of Africa. We have built to Empower Africa's Workforce,
                Advance Careers and to Move Africa Forward.
              </p>
              <p className="text-lg text-gray-400 max-w-4xl mx-auto mb-10">
                Every career deserves precise, actionable knowledge rooted in African realities.
                FWD App delivers the mastery, community, and credentials to advance your craft with confidence.
              </p>

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

            {/* Membership Value Section */}
            <section className="bg-brand-surface/80 border border-white/10 rounded-3xl p-10 backdrop-blur-sm">
              <div className="text-center mb-12">
                <p className="text-sm uppercase tracking-[0.2em] text-brand-primary mb-3">
                  A Platform Engineered for Growth and Mastery
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  A Forward Membership Gets You
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Brain className="h-7 w-7 text-brand-primary" />
                    <h3 className="text-white text-xl font-semibold">Expert Instructors</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Learn directly from the best business minds and proven experts across Africa,
                    ensuring relevance, credibility, and local context for every lesson.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-7 w-7 text-brand-primary" />
                    <h3 className="text-white text-xl font-semibold">Courses</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    High-quality, practical, on-demand business education covering essential topics.
                    Complete courses to earn verifiable FWD App Certifications that elevate your professional profile.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-7 w-7 text-brand-primary" />
                    <h3 className="text-white text-xl font-semibold">Akira</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Our revolutionary AI assistant and coach delivers crucial market data, regulatory insights,
                    and cultural nuances across Africa, acting as your trusted, all-in-one local expert.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
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
            <div className="mt-16">
              <p className="text-center text-sm uppercase tracking-[0.3em] text-brand-primary mb-6">
                More Reasons to Join
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { value: '10+', label: 'Certified Core Courses' },
                  { value: '50+', label: 'Hours of Expert Video Content for immediate, practical learning' },
                  { value: '54+', label: 'African Countries Covered by Afrisage Data for unmatched context' },
                  { value: '5+', label: 'Industry-Specific Forums for instant networking access' },
                ].map((item) => (
                  <div
                    key={item.value}
                    className="bg-brand-surface-muted/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
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
        <section className="relative z-10 bg-brand-background/90 backdrop-blur-sm py-20">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                To democratize access to Actionable Expertise for specific results, building and empowering a
                future-ready African workforce so every professional and entrepreneur can precisely advance their career.
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
            <div className="bg-brand-surface/70 border border-white/10 rounded-3xl p-10">
              <h3 className="text-3xl font-bold text-white mb-4">
                Precision-Engineered Learning for African Success.
              </h3>
              <p className="text-lg text-gray-300 mb-10 max-w-4xl">
                We believe the future of Africa is built by masters of their craft. FWD App is designed to drive that growth,
                providing accessible, actionable knowledge that delivers measurable results for professionals, entrepreneurs,
                and the organizations powering Africa's workforce.
              </p>
              <ul className="space-y-6">
                {[
                  {
                    title: 'Context-First Curriculum',
                    description:
                      'Access practical, results-driven training rooted in African economic, regulatory, and cultural realities. Learn the strategies that work here.',
                  },
                  {
                    title: 'Master Future-Proof Skills & Earn Credentials',
                    description:
                      'Develop vital business skills across leadership, technology, finance, and professional excellence, culminating in a verifiable Forward Africa Certification.',
                  },
                  {
                    title: 'Tangible Results, Guaranteed',
                    description:
                      'Apply your learnings immediately to your work or venture and see measurable impact on your career trajectory and business growth.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <span className="mt-2 h-3 w-3 rounded-full bg-brand-primary flex-shrink-0"></span>
                    <div>
                      <p className="text-white text-xl font-semibold">{item.title}</p>
                      <p className="text-gray-300">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
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
        <section className="relative z-10 bg-gradient-to-t from-brand-background to-transparent py-20">
          <div className="max-w-screen-xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Join Us in Shaping Africa's Future
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
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
