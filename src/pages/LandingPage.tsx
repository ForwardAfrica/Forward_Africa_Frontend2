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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
        {/* Simple Header with Logo and Login */}
        <header className="fixed top-0 w-full z-50">
          <div className="bg-black/90 backdrop-blur-sm border-b border-gray-800 mb-10">
            <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/home" className="flex items-center flex-shrink-0">
                  <div className="flex items-center">
                    <Image src="/images/logo/logo2.png" alt="Forward Africa Logo" width={32} height={32} className="mr-3" />
                    <span className="text-red-600 font-bold text-xl lg:text-2xl tracking-tight">FORWARD</span>
                    <span className="text-white font-bold text-xl lg:text-2xl tracking-tight">AFRICA</span>
                  </div>
                </Link>

                {/* Login Button */}
                <Link
                  href="/login"
                  className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                >
                  Login
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Background Image with Gradient Overlay */}
        <div className="fixed inset-0">
          <img
            src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-250 mt-64"></div>

        {/* Main Content */}
        <main className="relative z-10">
          <div className="max-w-screen-xl mx-auto px-4 pt-16 pb-32">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Empowering Africa's Entrepreneurs
              </h1>
              <p className="text-xl md:text-3xl text-red-500 font-bold mb-8">
                We don't train entrepreneurs, We build Systems
              </p>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
                At FWD App, we believe in the boundless potential of African entrepreneurs.
                We're bridging the gap between brilliant ideas and thriving businesses through
                quality education and market insights.
              </p>

              <Button
                variant="primary"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="group"
              >
                {isSigningIn ? 'Getting Started...' : 'Get Started'}
                <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20">
              <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">90%+</div>
                <div className="text-gray-300 text-sm">of African Businesses are SMEs</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">50%+</div>
                <div className="text-gray-300 text-sm">GDP Contribution</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">63%</div>
                <div className="text-gray-300 text-sm">Employment Rate</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">54</div>
                <div className="text-gray-300 text-sm">Countries Covered</div>
              </div>
            </div>
          </div>
        </main>

        {/* Mission Section */}
        <section className="relative z-10 bg-black/80 backdrop-blur-sm py-20">
          <div className="max-w-screen-xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-20">
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                To democratize business education and unlock the full economic potential of Africa
                by providing entrepreneurs with accessible knowledge, expert mentorship, a supportive
                community, and cutting-edge AI-powered insights.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="bg-red-500/10 rounded-lg p-3 inline-block mb-4">
                  <Brain className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">Courses</h3>
                <p className="text-gray-400">
                  High-quality, practical, on-demand business education covering essential topics
                  from marketing and finance to supply chain management and scaling strategies.
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="bg-red-500/10 rounded-lg p-3 inline-block mb-4">
                  <Users className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">Community</h3>
                <p className="text-gray-400">
                  A vibrant and supportive network where entrepreneurs can connect, share experiences,
                  collaborate on projects, and find peer support.
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="bg-red-500/10 rounded-lg p-3 inline-block mb-4">
                  <TrendingUp className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">Afrisage</h3>
                <p className="text-gray-400">
                  Our revolutionary AI assistant draws on critical information to provide unparalleled
                  business insight and guidance for African entrepreneurs.
                </p>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="bg-red-500/10 rounded-lg p-3 inline-block mb-4">
                  <Globe className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">Market Insights</h3>
                <p className="text-gray-400">
                  Access to crucial market data, regulatory information, and cultural insights
                  across African markets to make informed business decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative z-10 bg-gradient-to-t from-black to-transparent py-20">
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
