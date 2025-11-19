import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, ChevronDown, Brain, Users, TrendingUp, Globe, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Image from 'next/image';
import Footer from '../components/layout/Footer';
import { useCourses } from '../hooks/useDatabase';
import { Course } from '../types';

import { useAuth } from '../contexts/AuthContext';

// Mock data for trending courses - will be replaced by real API
const mockTrendingCourses: Course[] = [
  {
    id: 'mock-1',
    title: 'Business Strategy & Leadership',
    instructor: {
      id: 'instructor-1',
      name: 'Dr. Kwame Mensah',
      title: 'CEO & Business Strategist',
      image: '/images/placeholder-avatar.jpg',
      bio: '20+ years of experience in African business development',
      email: 'kwame@forwardafrica.com',
      expertise: ['Business Strategy', 'Leadership', 'Entrepreneurship'],
      experience: 20,
      createdAt: new Date(),
    },
    category: 'Business',
    thumbnail: '/images/placeholder-course.jpg',
    banner: '/images/placeholder-course.jpg',
    description: 'Master the art of strategic thinking and leadership in the African business context.',
    lessons: [
      { id: 'l1', title: 'Introduction to Strategic Thinking', duration: '15:30', thumbnail: '', videoUrl: '', description: '', xpPoints: 50 },
      { id: 'l2', title: 'Leadership Fundamentals', duration: '22:45', thumbnail: '', videoUrl: '', description: '', xpPoints: 75 },
      { id: 'l3', title: 'Case Studies from Africa', duration: '18:20', thumbnail: '', videoUrl: '', description: '', xpPoints: 60 },
    ],
    featured: true,
    totalXP: 1000,
    comingSoon: false,
  },
  {
    id: 'mock-2',
    title: 'Digital Marketing Mastery',
    instructor: {
      id: 'instructor-2',
      name: 'Amina Hassan',
      title: 'Digital Marketing Expert',
      image: '/images/placeholder-avatar.jpg',
      bio: 'Award-winning digital marketer with expertise in African markets',
      email: 'amina@forwardafrica.com',
      expertise: ['Digital Marketing', 'Social Media', 'Content Strategy'],
      experience: 12,
      createdAt: new Date(),
    },
    category: 'Marketing',
    thumbnail: '/images/placeholder-course.jpg',
    banner: '/images/placeholder-course.jpg',
    description: 'Learn how to build and scale your digital presence across African markets.',
    lessons: [
      { id: 'l1', title: 'Social Media Strategy', duration: '20:00', thumbnail: '', videoUrl: '', description: '', xpPoints: 50 },
      { id: 'l2', title: 'Content Creation', duration: '25:15', thumbnail: '', videoUrl: '', description: '', xpPoints: 75 },
      { id: 'l3', title: 'Analytics & Measurement', duration: '18:30', thumbnail: '', videoUrl: '', description: '', xpPoints: 60 },
    ],
    featured: true,
    totalXP: 1200,
    comingSoon: false,
  },
  {
    id: 'mock-3',
    title: 'Financial Management for Entrepreneurs',
    instructor: {
      id: 'instructor-3',
      name: 'Dr. Olumide Adeyemi',
      title: 'Financial Advisor & Consultant',
      image: '/images/placeholder-avatar.jpg',
      bio: 'Expert in African financial markets and startup financing',
      email: 'olumide@forwardafrica.com',
      expertise: ['Finance', 'Accounting', 'Investment'],
      experience: 15,
      createdAt: new Date(),
    },
    category: 'Finance',
    thumbnail: '/images/placeholder-course.jpg',
    banner: '/images/placeholder-course.jpg',
    description: 'Essential financial skills for building and managing successful businesses.',
    lessons: [
      { id: 'l1', title: 'Financial Planning Basics', duration: '30:00', thumbnail: '', videoUrl: '', description: '', xpPoints: 100 },
      { id: 'l2', title: 'Cash Flow Management', duration: '25:45', thumbnail: '', videoUrl: '', description: '', xpPoints: 85 },
      { id: 'l3', title: 'Investment Strategies', duration: '28:20', thumbnail: '', videoUrl: '', description: '', xpPoints: 90 },
    ],
    featured: true,
    totalXP: 1500,
    comingSoon: false,
  },
  {
    id: 'mock-4',
    title: 'Tech Innovation in Africa',
    instructor: {
      id: 'instructor-4',
      name: 'James Kariuki',
      title: 'Tech Entrepreneur',
      image: '/images/placeholder-avatar.jpg',
      bio: 'Founder of multiple successful tech startups in East Africa',
      email: 'james@forwardafrica.com',
      expertise: ['Technology', 'Innovation', 'Startups'],
      experience: 10,
      createdAt: new Date(),
    },
    category: 'Technology',
    thumbnail: '/images/placeholder-course.jpg',
    banner: '/images/placeholder-course.jpg',
    description: 'Explore the latest tech trends and innovation opportunities across Africa.',
    lessons: [
      { id: 'l1', title: 'Tech Landscape in Africa', duration: '22:00', thumbnail: '', videoUrl: '', description: '', xpPoints: 70 },
      { id: 'l2', title: 'Building Tech Solutions', duration: '27:30', thumbnail: '', videoUrl: '', description: '', xpPoints: 90 },
      { id: 'l3', title: 'Scaling Tech Businesses', duration: '24:15', thumbnail: '', videoUrl: '', description: '', xpPoints: 80 },
    ],
    featured: true,
    totalXP: 1300,
    comingSoon: false,
  },
  {
    id: 'mock-5',
    title: 'Sales & Customer Relations',
    instructor: {
      id: 'instructor-5',
      name: 'Fatima Diallo',
      title: 'Sales Director',
      image: '/images/placeholder-avatar.jpg',
      bio: 'Top-performing sales professional with expertise in B2B and B2C markets',
      email: 'fatima@forwardafrica.com',
      expertise: ['Sales', 'Customer Relations', 'Negotiation'],
      experience: 14,
      createdAt: new Date(),
    },
    category: 'Sales',
    thumbnail: '/images/placeholder-course.jpg',
    banner: '/images/placeholder-course.jpg',
    description: 'Master the art of sales and build lasting customer relationships.',
    lessons: [
      { id: 'l1', title: 'Sales Fundamentals', duration: '19:45', thumbnail: '', videoUrl: '', description: '', xpPoints: 65 },
      { id: 'l2', title: 'Customer Relationship Building', duration: '23:20', thumbnail: '', videoUrl: '', description: '', xpPoints: 75 },
      { id: 'l3', title: 'Closing Techniques', duration: '21:10', thumbnail: '', videoUrl: '', description: '', xpPoints: 70 },
    ],
    featured: true,
    totalXP: 1100,
    comingSoon: false,
  },
  {
    id: 'mock-6',
    title: 'Agribusiness & Food Security',
    instructor: {
      id: 'instructor-6',
      name: 'Dr. Ngozi Okonkwo',
      title: 'Agricultural Economist',
      image: '/images/placeholder-avatar.jpg',
      bio: 'Leading expert in sustainable agriculture and food security in Africa',
      email: 'ngozi@forwardafrica.com',
      expertise: ['Agriculture', 'Food Security', 'Sustainability'],
      experience: 18,
      createdAt: new Date(),
    },
    category: 'Agriculture',
    thumbnail: '/images/placeholder-course.jpg',
    banner: '/images/placeholder-course.jpg',
    description: 'Build sustainable agribusinesses and contribute to food security in Africa.',
    lessons: [
      { id: 'l1', title: 'Modern Farming Techniques', duration: '26:30', thumbnail: '', videoUrl: '', description: '', xpPoints: 85 },
      { id: 'l2', title: 'Supply Chain Management', duration: '24:45', thumbnail: '', videoUrl: '', description: '', xpPoints: 80 },
      { id: 'l3', title: 'Market Access & Export', duration: '22:15', thumbnail: '', videoUrl: '', description: '', xpPoints: 75 },
    ],
    featured: true,
    totalXP: 1400,
    comingSoon: false,
  },
];

const LandingPage: React.FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { courses, featuredCourses, fetchAllCourses, fetchFeaturedCourses } = useCourses();

  const handleGoogleSignIn = async () => {
    // Navigate to the main login page for better user experience
    router.push('/login');
  };

  useEffect(() => {
    fetchAllCourses(false); // Don't include coming soon courses
    fetchFeaturedCourses();
  }, [fetchAllCourses, fetchFeaturedCourses]);

  useEffect(() => {
    // Set trending courses - prioritize featured courses, then take first 6 available courses
    // Use mock data if no real courses are available (for testing)
    const availableCourses = courses.filter(course => !course.comingSoon);
    let trending: Course[] = [];

    if (featuredCourses.length > 0) {
      trending = featuredCourses.slice(0, 6);
    } else if (availableCourses.length > 0) {
      trending = availableCourses.slice(0, 6);
    } else {
      // Use mock data when no real API data is available
      trending = mockTrendingCourses;
    }

    setTrendingCourses(trending);
  }, [courses, featuredCourses]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const formatDuration = (lessons: any[]) => {
    if (!lessons || lessons.length === 0) return '0 minutes';
    const totalSeconds = lessons.reduce((acc, lesson) => {
      const [minutes, seconds] = (lesson.duration || '0:00').split(':').map(Number);
      return acc + (minutes * 60) + (seconds || 0);
    }, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-brand-background/90"
    >
        {/* Simple Header with Logo and Login */}
        <header className="relative w-full z-50">
          <div className="mb-10">
            <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-24 md:h-28">
                {/* Logo */}
                <Link href="/home" className="flex items-center flex-shrink-0">
                  <Image
                    src="/images/chosen2.png"
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
                  className="text-white bg-[#ef4444] hover:bg-[#dc2626] hover:shadow-lg px-4 py-2 text-sm font-medium rounded-md transition-transform hover:scale-[1.02]"
                >
                  Login
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Hero Section */}
            <div className="text-center mb-20 md:mb-24 py-12 md:py-16">
              <h1 className="text-7xl md:text-9xl lg:text-[8rem] font-bold text-white mb-6 md:mb-8">
              Get Smarter, Faster.
              </h1>
              <p className="text-xl md:text-3xl lg:text-4xl text-red-500 font-semibold mb-8 md:mb-10">
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
            </div>

            {/* Mission Statement Section */}
            <section className="mb-20 md:mb-24">
              <div className="text-center mb-12 md:mb-16">
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  We have built to Empower Africa's Workforce, Advance Careers and to Move Africa Forward.
                </p>
              </div>

              {/* Trending Courses Section */}
              <div className="mb-12 md:mb-16">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Trending Courses</h2>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/courses"
                      className="text-sm md:text-base text-gray-400 hover:text-red-500 transition-colors"
                    >
                      See all
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={scrollLeft}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={scrollRight}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all hover:scale-110"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {trendingCourses.length > 0 ? (
                  <div className="relative">
                    <div
                      ref={scrollContainerRef}
                      className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {trendingCourses.map((course) => (
                        <Link
                          key={course.id}
                          href={`/course/${course.id}`}
                          className="flex-shrink-0 w-64 md:w-72 group"
                        >
                          <div className="relative rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-all h-[420px] flex flex-col">
                            <div className="relative h-64 flex-shrink-0 overflow-hidden">
                              <Image
                                src={course.thumbnail || '/images/placeholder-course.jpg'}
                                alt={course.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {/* Fading gradient overlay from bottom */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                              <div className="absolute top-3 left-3 bg-red-500 rounded-lg px-2 py-1 z-10">
                                <span className="text-white text-xs font-semibold">New</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-black via-black/95 to-transparent">
                              <h3 className="text-base md:text-lg font-bold text-white mb-2 line-clamp-2">
                                {course.title}
                              </h3>
                              {course.instructor && (
                                <p className="text-gray-400 text-xs md:text-sm mb-2 line-clamp-1">
                                  {course.instructor.name}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(course.lessons)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No trending courses available at the moment.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Membership Value Section */}
            <section className="bg-brand-surface/80 border border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 backdrop-blur-sm mb-20 md:mb-24">
              <div className="text-center mb-12 md:mb-16">
                <p className="text-sm md:text-base uppercase tracking-[0.2em] text-red-500 mb-4 md:mb-5">
                  A Platform Engineered for Growth and Mastery
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  A Forward Membership Gets You
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <Brain className="h-7 w-7 text-red-500" />
                    <h3 className="text-white text-xl font-semibold">Expert Instructors</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Learn directly from the best business minds and proven experts across Africa,
                    ensuring relevance, credibility, and local context for every lesson.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-7 w-7 text-red-500" />
                    <h3 className="text-white text-xl font-semibold">Courses</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    High-quality, practical, on-demand business education covering essential topics.
                    Complete courses to earn verifiable FWD App Certifications that elevate your professional profile.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <Globe className="h-7 w-7 text-red-500" />
                    <h3 className="text-white text-xl font-semibold">Akira</h3>
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Our revolutionary AI assistant and coach delivers crucial market data, regulatory insights,
                    and cultural nuances across Africa, acting as your trusted, all-in-one local expert.
                  </p>
                </div>
                <div className="bg-brand-surface-muted/70 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-5">
                  <div className="flex items-center gap-3">
                    <Users className="h-7 w-7 text-red-500" />
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
              <p className="text-center text-sm md:text-base uppercase tracking-[0.3em] text-red-500 mb-8 md:mb-10">
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
                    <div className="text-4xl font-extrabold text-red-500 mb-3">{item.value}</div>
                    <div className="text-gray-300 text-sm leading-relaxed">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Mission Section */}
        <section className="relative z-10 bg-brand-background/90 backdrop-blur-sm pt-2 md:pt-4 lg:pt-6 pb-16 md:pb-24 lg:pb-32">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20 lg:mb-24 py-2 md:py-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8">Our Mission</h2>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 md:mb-10">
              Expert Education to build the African Workforce, for precise advancement strategies of careers and Africa.
              </p>

              <p className="text-xl md:text-3xl lg:text-4xl text-red-500 font-semibold mb-8 md:mb-10">
              Join The Movement.
              </p>

              <Button
                variant="primary"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="group"
              >
                {isSigningIn ? 'Joining...' : 'Master Your Craft, Move Forward.'}
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
                        className={`h-5 w-5 text-red-500 flex-shrink-0 transition-transform duration-300 ${
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
                  {isSigningIn ? 'Investing...' : 'Invest in your Career.'}
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Courses Section */}
        <section className="relative z-10 bg-brand-background/90 backdrop-blur-sm pt-8 md:pt-12 pb-16 md:pb-24 lg:pb-32">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Coming Soon
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Course Card 1 */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 group hover:border-white/20 transition-all">
                <div className="relative h-36 md:h-40 overflow-hidden">
                  {/* Placeholder for course image - you can replace with actual images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="absolute inset-0 opacity-30">
                      {/* Glitch effect overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,0,0,0.1)_50%,transparent_100%)] animate-pulse"></div>
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,0,0.1)_50%,transparent_100%)] animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,255,0.1)_50%,transparent_100%)] animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    {/* Placeholder for people/illustration */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  {/* Gradient overlay to make images visible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  {/* Date Tag */}
                  <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1 z-10">
                    <span className="text-black text-xs font-semibold">Nov 25</span>
                  </div>
                </div>
                <div className="bg-gradient-to-b from-transparent via-black/60 to-black/90 p-4 md:p-5">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1.5">
                    CYBERWARFARE
                  </h3>
                  <div className="w-10 h-0.5 bg-white mb-3"></div>
                  <p className="text-gray-300 text-xs md:text-sm">
                    with Former NSA and US Cyber Command leaders
                  </p>
                </div>
              </div>

              {/* Course Card 2 */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 group hover:border-white/20 transition-all">
                <div className="relative h-36 md:h-40 overflow-hidden">
                  {/* Placeholder for course image - you can replace with actual images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="absolute inset-0 opacity-30">
                      {/* Glitch effect overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,0,0,0.1)_50%,transparent_100%)] animate-pulse"></div>
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,0,0.1)_50%,transparent_100%)] animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,0,255,0.1)_50%,transparent_100%)] animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    {/* Placeholder for people/illustration */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  {/* Gradient overlay to make images visible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  {/* Date Tag */}
                  <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1 z-10">
                    <span className="text-black text-xs font-semibold">Dec 15</span>
                  </div>
                </div>
                <div className="bg-gradient-to-b from-transparent via-black/60 to-black/90 p-4 md:p-5">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1.5">
                    COURSE TITLE
                  </h3>
                  <div className="w-10 h-0.5 bg-white mb-3"></div>
                  <p className="text-gray-300 text-xs md:text-sm">
                    Course description or tagline here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative z-10 bg-gradient-to-t from-brand-background to-transparent pt-4 md:pt-6 pb-16 md:pb-24 lg:pb-32">
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
