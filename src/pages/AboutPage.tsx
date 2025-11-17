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
      icon: <Users className="h-8 w-8 text-brand-primary" />,
      title: 'Expert Instructors',
      description:
        'Learn directly from vetted business minds and proven experts across Africa for unmatched relevance and credibility.'
    },
    {
      icon: <BookOpen className="h-8 w-8 text-brand-primary" />,
      title: 'Courses',
      description:
        'High-quality, practical, on-demand business education delivering verifiable FWD App certifications that strengthen your profile.'
    },
    {
      icon: <Brain className="h-8 w-8 text-brand-primary" />,
      title: 'Akira',
      description:
        'Our AI assistant and coach delivers market data, regulatory insight, and cultural nuance—your trusted local expert on demand.'
    },
    {
      icon: <Globe className="h-8 w-8 text-brand-primary" />,
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
      <div className="min-h-screen bg-brand-gradient">
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <section className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-4">
              About Forward Africa
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get Smarter, Faster            </h1>
            <p className="text-2xl text-brand-primary font-semibold mb-6">
            Acquire the Skills to Move Forward.
            </p>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              We believe in the boundless potential of Africa. We built the FWD App to
              empower Africa’s workforce, advance careers, and move the continent
              forward with precision-engineered learning.
            </p>
            <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 hover:shadow-lg text-white px-8 py-4 rounded-lg transition-colors text-lg font-semibold">
              Start Learning Today
            </button>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            We have built to Empower Africa’s Workforce, Advance Careers and to Move Africa Forward.
            </p>
          </section>

          <section className="bg-brand-surface/70 border border-white/10 rounded-3xl p-8 mb-16 backdrop-blur">
            <h2 className="text-3xl font-bold text-white mb-6">Metrics</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="bg-brand-surface-muted/60 border border-white/10 rounded-2xl p-6"
                >
                  <div className="text-4xl font-extrabold text-brand-primary mb-3">
                    {metric.value}
                  </div>
                  <div className="text-white text-lg font-semibold mb-2">
                    {metric.label}
                  </div>
                  {metric.helper && (
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {metric.helper}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Visit Platform
              </button>
              <button className="border border-brand-primary/50 text-white px-6 py-3 rounded-lg font-semibold hover:border-white transition-colors">
                Learn More
              </button>
            </div>
          </section>

          <section className="bg-gradient-to-r from-brand-primary/20 to-brand-background/40 rounded-3xl border border-white/10 p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-5">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
            Expert Education to build the African Workforce, for precise advancement strategies of careers and Africa.
            </p>
            <p className="text-brand-primary text-xl font-semibold mt-8">
              Precision-Engineered Learning for African Success.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed mt-4">
              The future of Africa is built by masters of their craft. FWD App is
              designed to drive that growth with accessible, actionable knowledge that
              translates directly into measurable results for professionals,
              entrepreneurs, and the organizations powering Africa’s workforce.
            </p>
          </section>

          <section className="mb-16">
            <div className="space-y-4">
              {precisionHighlights.map((item, index) => (
                <div
                  key={item.title}
                  className="bg-brand-surface/70 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                  >
                    <h3 className="text-white text-xl font-semibold pr-4">
                      {item.title}
                    </h3>
                    <ChevronDown
                      className={`h-5 w-5 text-brand-primary flex-shrink-0 transition-transform duration-300 ${
                        expandedCard === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedCard === index && (
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-gray-300 text-base leading-relaxed">
                        {item.copy}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">
              A Platform Engineered for Growth and Mastery
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-3xl">
              A Forward membership provides the infrastructure, people, and tools you
              need to master your craft and see measurable outcomes quickly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {membershipBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-brand-surface/70 border border-white/10 rounded-2xl p-6"
                >
                  <div className="bg-brand-primary/10 rounded-lg p-3 inline-flex mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-white text-2xl font-semibold mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-400 text-base leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center bg-brand-surface/80 border border-white/10 rounded-3xl p-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Move Forward?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
              Expert instructors, transformative curriculum, Akira AI co-pilot, and a
              thriving community—all inside one membership made for Africa’s builders.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 hover:shadow-lg text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Reach Out to Us
              </button>
              <button className="border border-brand-primary/50 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:border-white transition-colors">
                Start Learning Today
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;