import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Brain, Globe, ChevronDown, TrendingUp, Award, Target, Zap, ArrowRight } from 'lucide-react';
import Layout from '../components/layout/Layout';

const AboutPage: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsVisible(true);
  }, []);

  const metrics = [
    { value: '10+', label: 'Certified Core Courses', icon: BookOpen },
    {
      value: '50+',
      label: 'Hours of Expert Video Content',
      helper: 'Immediate depth of practical, high-impact learning',
      icon: Zap
    },
    {
      value: '54+',
      label: 'African Countries Covered by Afrisage Data',
      helper: 'Unparalleled local context for decisions',
      icon: Globe
    },
    {
      value: '5+',
      label: 'Industry-Specific Forums',
      helper: 'Instant access to peers and coaches',
      icon: Users
    },
    { value: '12k+', label: 'Active Learners Across Africa', icon: TrendingUp },
    { value: '650+', label: 'Subject-Matter Experts & Coaches', icon: Award }
  ];

  const membershipBenefits = [
    {
      icon: Users,
      title: 'Expert Instructors',
      description:
        'Learn directly from vetted business minds and proven experts across Africa for unmatched relevance and credibility.',
      gradient: 'from-blue-500/20 to-purple-500/20'
    },
    {
      icon: BookOpen,
      title: 'Courses',
      description:
        'High-quality, practical, on-demand business education delivering verifiable FWD App certifications that strengthen your profile.',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: Brain,
      title: 'Akira',
      description:
        'Our AI assistant and coach delivers market data, regulatory insight, and cultural nuance—your trusted local expert on demand.',
      gradient: 'from-pink-500/20 to-blue-500/20'
    },
    {
      icon: Globe,
      title: 'Community',
      description:
        'A vibrant network for professionals and entrepreneurs to collaborate, share experiences, and build high-value support systems.',
      gradient: 'from-purple-500/20 to-blue-500/20'
    }
  ];

  const precisionHighlights = [
    {
      title: 'Context-First Curriculum',
      copy:
        'Practical, results-driven training rooted in African economic, regulatory, and cultural realities with strategies that work here.',
      icon: Target
    },
    {
      title: 'Master Future-Proof Skills & Earn Credentials',
      copy:
        'Build the leadership, technology, finance, and professional excellence needed to navigate a dynamic landscape and graduate with a verifiable Forward Africa Certification.',
      icon: Award
    },
    {
      title: 'Tangible Results, Guaranteed',
      copy:
        'Apply your learning immediately to daily work and ventures, ensuring measurable impact on career trajectory and business growth.',
      icon: TrendingUp
    }
  ];

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-deepPurple/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-vibrantPink/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className={`max-w-7xl mx-auto py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Hero Section */}
          <section className="text-center mb-16 sm:mb-20 md:mb-24">
            <div className="inline-block mb-6">
              <span className="text-xs sm:text-sm md:text-base uppercase tracking-[0.3em] text-brand-primary font-semibold px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full backdrop-blur-sm">
                About Forward Africa
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-brand-primary to-brand-vibrantPink bg-clip-text text-transparent">
                Get Smarter, Faster
              </span>
            </h1>
            
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Acquire the Skills to Move Forward.
            </p>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed">
              We believe in the boundless potential of Africa. We built the FWD App to
              empower Africa's workforce, advance careers, and move the continent
              forward with <span className="text-brand-primary font-semibold">precision-engineered learning</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50 flex items-center gap-2">
                Start Learning Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-brand-surface/80 border-2 border-white/20 hover:border-brand-primary/50 text-white rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm">
                Learn More
              </button>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto italic">
              "We have built to Empower Africa's Workforce, Advance Careers and to Move Africa Forward."
            </p>
          </section>

          {/* Metrics Section */}
          <section className="mb-16 sm:mb-20 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Our Impact in Numbers
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Real metrics that showcase our commitment to transforming Africa's workforce
              </p>
            </div>
            
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {metrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="group relative bg-gradient-to-br from-brand-surface/90 to-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-brand-primary/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-brand-primary/20 backdrop-blur-sm overflow-hidden"
                  >
                    {/* Animated background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/0 to-brand-vibrantPink/0 group-hover:from-brand-primary/10 group-hover:to-brand-vibrantPink/10 transition-all duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="inline-flex p-3 bg-gradient-to-br from-brand-primary/20 to-brand-vibrantPink/20 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6 text-brand-primary" />
                      </div>
                      <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-3">
                        {metric.value}
                      </div>
                      <div className="text-white text-lg sm:text-xl font-semibold mb-2">
                        {metric.label}
                      </div>
                      {metric.helper && (
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {metric.helper}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mission Section */}
          <section className="mb-16 sm:mb-20 md:mb-24 relative">
            <div className="relative bg-gradient-to-br from-brand-primary/20 via-brand-deepPurple/20 to-brand-vibrantPink/20 rounded-3xl border border-white/20 p-8 sm:p-10 md:p-12 lg:p-16 backdrop-blur-sm overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-vibrantPink/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-8 w-8 text-brand-primary" />
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Our Mission</h2>
                </div>
                
                <p className="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-8 max-w-4xl">
                  Expert Education to build the African Workforce, for precise advancement strategies of careers and Africa.
                </p>
                
                <div className="bg-brand-surface/60 rounded-2xl p-6 sm:p-8 border border-white/10 backdrop-blur-sm">
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-6">
                    Precision-Engineered Learning for African Success.
                  </p>
                  <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                    The future of Africa is built by masters of their craft. FWD App is
                    designed to drive that growth with accessible, actionable knowledge that
                    translates directly into measurable results for professionals,
                    entrepreneurs, and the organizations powering Africa's workforce.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Precision Highlights Section */}
          <section className="mb-16 sm:mb-20 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Why Forward Africa?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Discover what makes our platform uniquely powerful
              </p>
            </div>
            
            <div className="space-y-4">
              {precisionHighlights.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group bg-gradient-to-r from-brand-surface/90 to-brand-surface-muted/70 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-primary/50 hover:shadow-xl hover:shadow-brand-primary/10"
                  >
                    <button
                      onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 sm:p-8 text-left hover:bg-gradient-to-r hover:from-brand-primary/5 hover:to-brand-vibrantPink/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 sm:gap-6 flex-1">
                        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-brand-primary/20 to-brand-vibrantPink/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-brand-primary" />
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white pr-4">
                          {item.title}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`h-6 w-6 sm:h-7 sm:w-7 text-brand-primary flex-shrink-0 transition-transform duration-300 ${
                          expandedCard === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ${
                      expandedCard === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                        <p className="text-gray-300 text-base sm:text-lg leading-relaxed pl-0 sm:pl-20">
                          {item.copy}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Platform Features Section */}
          <section className="mb-16 sm:mb-20 md:mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                A Platform Engineered for Growth and Mastery
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto">
                A Forward membership provides the infrastructure, people, and tools you
                need to master your craft and see measurable outcomes quickly.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {membershipBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="group relative bg-gradient-to-br from-brand-surface/90 to-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-brand-primary/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-primary/20 overflow-hidden backdrop-blur-sm"
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    
                    <div className="relative z-10">
                      <div className="inline-flex p-4 bg-gradient-to-br from-brand-primary/20 to-brand-vibrantPink/20 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-brand-primary" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative">
            <div className="relative bg-gradient-to-br from-brand-primary/30 via-brand-deepPurple/30 to-brand-vibrantPink/30 rounded-3xl border-2 border-white/20 p-10 sm:p-12 md:p-16 lg:p-20 text-center backdrop-blur-sm overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-vibrantPink/0 to-brand-primary/0 animate-pulse-slow"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Ready to Move Forward?
                </h2>
                <p className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Expert instructors, transformative curriculum, Akira AI co-pilot, and a
                  thriving community—all inside one membership made for Africa's builders.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="group px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50 flex items-center gap-2">
                    Reach Out to Us
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center gap-2">
                    Start Learning Today
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;