import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import HeroBanner from '../components/ui/HeroBanner';
import CategoryRow from '../components/ui/CategoryRow';
import ContinueLearningRow from '../components/ui/ContinueLearningRow';
import CourseCard from '../components/ui/CourseCard';
import { CourseProgress, Course } from '../types';
import { Award, Users, Star, BookOpen } from 'lucide-react';
import { useCourses, useUserProgress, useAnalytics } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import { useProtectedPage } from '../hooks/useProtectedPage';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Protect this page - redirect to login if no valid token
  useProtectedPage();
  const [inProgressCourses, setInProgressCourses] = useState<CourseProgress[]>([]);

  // Database hooks
  const {
    courses: allCourses,
    featuredCourses,
    loading: coursesLoading,
    error: coursesError,
    fetchAllCourses,
    fetchFeaturedCourses
  } = useCourses();

  const {
    progress: userProgress,
    loading: progressLoading,
    fetchUserProgress
  } = useUserProgress(user?.id || '');

  const {
    stats: platformStats,
    loading: statsLoading,
    fetchPlatformStats
  } = useAnalytics();

  // Fetch data on component mount
  useEffect(() => {
    fetchAllCourses();
    fetchFeaturedCourses();
    fetchPlatformStats();
  }, [fetchAllCourses, fetchFeaturedCourses, fetchPlatformStats]);

  // Fetch user progress when user is available
  useEffect(() => {
    if (user?.id) {
      console.log('👤 HomePage: Fetching user progress for user:', user.id);
      fetchUserProgress();
    }
  }, [user?.id, fetchUserProgress]);

  // Process user progress to create in-progress courses
  useEffect(() => {
    if (userProgress.length > 0 && allCourses.length > 0) {
      const coursesWithProgress = userProgress.map((progress) => {
        const course = allCourses.find((c: Course) => c.id === progress.courseId);
          if (!course) return null;

          return {
            ...course,
          progress: progress.progress,
          currentLesson: course.lessons?.find((l: any) => l.id === progress.lessonId) || course.lessons?.[0],
          lastWatched: progress.lastWatched,
          xpEarned: progress.xpEarned,
          completedLessons: progress.completedLessons || []
          };
        }).filter((course): course is CourseProgress => course !== null);

        // Sort by last watched date
        coursesWithProgress.sort((a, b) =>
          new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
        );

        setInProgressCourses(coursesWithProgress);
      }
  }, [userProgress, allCourses]);

  const handlePlayCourse = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  // Show loading state
  if (coursesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (coursesError) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Courses</h2>
            <p className="text-gray-400 mb-4">{coursesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }



  // Show empty state
  if (allCourses.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-gray-500 text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Courses Available</h2>
            <p className="text-gray-400">Check back later for new courses!</p>
          </div>
        </div>
      </Layout>
    );
  }

  const featuredCourse = featuredCourses.length > 0 ? featuredCourses[0] : allCourses[0];

  return (
    <Layout>
      <div className="pb-10 homepage">
        {/* Hero Banner - Always show with fallback data */}
        <HeroBanner course={featuredCourse} onPlay={handlePlayCourse} />

        {/* Stats Section */}
        <div className="bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                <Award className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {platformStats?.totalInstructors || '50+'}
                </div>
                <div className="text-gray-400">Expert Instructors</div>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                <BookOpen className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {`${platformStats?.totalCourses || allCourses.length}+`}
                </div>
                <div className="text-gray-400">Courses</div>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                <Users className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {platformStats?.totalUsers || '10K+'}
                </div>
                <div className="text-gray-400">Active Learners</div>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                <Star className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">4.8</div>
                <div className="text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        {inProgressCourses.length > 0 && (
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-white text-2xl font-bold mb-6">Continue Learning</h2>
            <div className="space-y-8">
              {(() => {
                const cardsPerRow = 5;
                const rows = [];

                for (let i = 0; i < inProgressCourses.length; i += cardsPerRow) {
                  const rowCourses = inProgressCourses.slice(i, i + cardsPerRow);
                  const rowIndex = Math.floor(i / cardsPerRow);

                  rows.push(
                    <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10 card-grid-container" data-row-id={rowIndex}>
                      {rowCourses.map(course => (
                        <CourseCard key={course.id} course={course} rowId={rowIndex} />
                      ))}
                    </div>
                  );
                }

                return rows;
              })()}
            </div>
          </div>
        )}

        {/* Featured Classes Section */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-white text-2xl font-bold mb-6">Featured Classes</h2>
          <div className="space-y-8">
            {(() => {
              const cardsPerRow = 5;
              const rows = [];

              for (let i = 0; i < featuredCourses.length; i += cardsPerRow) {
                const rowCourses = featuredCourses.slice(i, i + cardsPerRow);
                const rowIndex = Math.floor(i / cardsPerRow);

                rows.push(
                  <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10 card-grid-container" data-row-id={rowIndex}>
                    {rowCourses.map(course => (
                      <CourseCard key={course.id} course={course} rowId={rowIndex} />
                    ))}
                  </div>
                );
              }

              return rows;
            })()}
          </div>
        </div>

        {/* Category Rows - Group courses by category */}
        {(() => {
          const categories = Array.from(new Set(allCourses.map((course: Course) => course.category)));

          return categories.map((categoryName) => {
            const categoryCourses = allCourses.filter((course: Course) => course.category === categoryName);

            if (categoryCourses.length > 0 && categoryName !== 'Featured') {
              return (
                <div key={categoryName} className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <h2 className="text-white text-2xl font-bold mb-6">{categoryName}</h2>
                  <div className="space-y-8">
                    {(() => {
                      const cardsPerRow = 5;
                      const rows = [];

                      for (let i = 0; i < categoryCourses.length; i += cardsPerRow) {
                        const rowCourses = categoryCourses.slice(i, i + cardsPerRow);
                        const rowIndex = Math.floor(i / cardsPerRow);

                        rows.push(
                          <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10 card-grid-container" data-row-id={rowIndex}>
                            {rowCourses.map(course => (
                              <CourseCard key={course.id} course={course} rowId={rowIndex} />
                            ))}
                          </div>
                        );
                      }

                      return rows;
                    })()}
                  </div>
                </div>
              );
            }

            return null;
          });
        })()}
      </div>
    </Layout>
  );
};

export default HomePage;
