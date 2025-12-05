import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Brain, Globe, ChevronDown } from 'lucide-react';
import Layout from '../components/layout/Layout';

const AboutPage: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const metrics = [
    { value: '10+', label: 'Certified Core Courses' },
    {
      value: '50+',
      label: 'Hours of Expert Video Content',
      helper: 'Immediate depth of practical, high-impact learning'
    },
    {
      value: '54+',
      label: 'African Countries Covered by Afrisage Data',
      helper: 'Unparalleled local context for decisions'
    },
    {
      value: '5+',
      label: 'Industry-Specific Forums',
      helper: 'Instant access to peers and coaches'
    },
    { value: '12k+', label: 'Active Learners Across Africa' },
    { value: '650+', label: 'Subject-Matter Experts & Coaches' }
  ];

  const membershipBenefits = [
    {
      icon: Users,
      title: 'Expert Instructors',
      description:
        'Learn directly from vetted business minds and proven experts across Africa for unmatched relevance and credibility.'
    },
    {
      icon: BookOpen,
      title: 'Courses',
      description:
        'High-quality, practical, on-demand business education delivering verifiable FWD App certifications that strengthen your profile.'
    },
    {
      icon: Brain,
      title: 'Akira',
      description:
        'Our AI assistant and coach delivers market data, regulatory insight, and cultural nuance—your trusted local expert on demand.'
    },
    {
      icon: Globe,
      title: 'Community',
      description:
        'A vibrant network for professionals and entrepreneurs to collaborate, share experiences, and build high-value support systems.'
    }
  ];

  const precisionHighlights = [
    {
      title: 'Context-First Curriculum',
      copy:
        'Practical, results-driven training rooted in African economic, regulatory, and cultural realities with strategies that work here.'
    },
    {
      title: 'Master Future-Proof Skills & Earn Credentials',
      copy:
        'Build the leadership, technology, finance, and professional excellence needed to navigate a dynamic landscape and graduate with a verifiable Forward Africa Certification.'
    },
    {
      title: 'Tangible Results, Guaranteed',
      copy:
        'Apply your learning immediately to daily work and ventures, ensuring measurable impact on career trajectory and business growth.'
    }
  ];

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <section className="text-center mt-4 sm:mt-6 md:mt-8 lg:mt-12 xl:mt-16 mb-10 sm:mb-12 md:mb-16">
            <p className="text-sm sm:text-base md:text-lg lg:text-xl uppercase tracking-[0.3em] text-white mb-3 sm:mb-4 px-4">
              About Forward Africa
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 px-4 leading-tight">
            Get Smarter, Faster            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-red-500 font-semibold mb-4 sm:mb-5 md:mb-6 px-4">
            Acquire the Skills to Move Forward.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4">
              We believe in the boundless potential of Africa. We built the FWD App to
              empower Africa's workforce, advance careers, and move the continent
              forward with precision-engineered learning.
            </p>
            <div className="px-4 mb-6 sm:mb-8 md:mb-10">
              <button className="bg-[#ef4444] hover:bg-[#dc2626] hover:shadow-lg text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg transition-colors text-base sm:text-lg font-semibold w-full sm:w-auto">
                Start Learning Today
              </button>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mt-6 sm:mt-7 md:mt-8 mb-8 sm:mb-9 md:mb-10 px-4">
            We have built to Empower Africa's Workforce, Advance Careers and to Move Africa Forward.
            </p>
          </section>
          <section>
          </section>

          <section className="bg-brand-surface/70 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-10 sm:mb-12 md:mb-16 backdrop-blur">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-5 md:mb-6">Metrics</h2>
            <div className="grid gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="bg-brand-surface-muted/60 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6"
                >
                  <div className="text-3xl sm:text-4xl font-extrabold text-red-500 mb-2 sm:mb-3">
                    {metric.value}
                  </div>
                  <div className="text-white text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">
                    {metric.label}
                  </div>
                  {metric.helper && (
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                      {metric.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 sm:mt-9 md:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <button className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors w-full sm:w-auto">
                Visit Platform
              </button>
              <button className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors w-full sm:w-auto">
                Learn More
              </button>
            </div>
          </section>

          <section className="bg-gradient-to-r from-brand-primary/20 to-brand-background/40 rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-8 mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-5">Our Mission</h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            Expert Education to build the African Workforce, for precise advancement strategies of careers and Africa.
            </p>
            <p className="text-red-500 text-lg sm:text-xl font-semibold mt-6 sm:mt-7 md:mt-8">
              Precision-Engineered Learning for African Success.
            </p>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mt-3 sm:mt-4">
              The future of Africa is built by masters of their craft. FWD App is
              designed to drive that growth with accessible, actionable knowledge that
              translates directly into measurable results for professionals,
              entrepreneurs, and the organizations powering Africa's workforce.
            </p>
          </section>

          <section className="mb-10 sm:mb-12 md:mb-16">
            <div className="space-y-3 sm:space-y-4">
              {precisionHighlights.map((item, index) => (
                <div
                  key={item.title}
                  className="bg-brand-surface/70 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left hover:bg-brand-deepPurple/10 transition-colors"
                  >
                    <h3 className="text-white text-base sm:text-lg md:text-xl font-semibold pr-3 sm:pr-4">
                      {item.title}
                    </h3>
                    <ChevronDown
                      className={`h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 transition-transform duration-300 ${
                        expandedCard === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedCard === index && (
                    <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-0">
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {item.copy}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-5 sm:mb-6 md:mb-8">
              A Platform Engineered for Growth and Mastery
            </h2>
            <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-7 md:mb-8 max-w-3xl">
              A Forward membership provides the infrastructure, people, and tools you
              need to master your craft and see measurable outcomes quickly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
              {membershipBenefits.map((benefit) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="bg-brand-surface/70 border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6"
                  >
                    <div className="bg-brand-primary/10 rounded-lg p-2.5 sm:p-3 inline-flex mb-3 sm:mb-4">
                      <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-500" />
                    </div>
                    <h3 className="text-white text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="text-center bg-brand-surface/80 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Ready to Move Forward?
            </h2>
            <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-7 md:mb-8 max-w-3xl mx-auto">
              Expert instructors, transformative curriculum, Akira AI co-pilot, and a
              thriving community—all inside one membership made for Africa's builders.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <button className="bg-[#ef4444] hover:bg-[#dc2626] hover:shadow-lg text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-colors w-full sm:w-auto">
                Reach Out to Us
              </button>
              <button className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-colors w-full sm:w-auto">
                Start Learning Today
              </button>
            </div>
          </section>
        </div>
    </Layout>
  );
};

export default AboutPage;