import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import CourseCard from '../components/ui/CourseCard';
import { useCourses } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';

const CoursesPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Database hooks - same as HomePage
  const {
    courses: allCourses,
    loading: apiLoading,
    error: apiError,
    fetchAllCourses
  } = useCourses();

  // Fetch data on component mount - same as HomePage
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch from API - same as HomePage
        await fetchAllCourses();
      } catch (err) {
        console.error('Failed to load courses:', err);
        setError('Failed to load courses from server');
        setLoading(false);
      }
    };

    loadCourses();
  }, [fetchAllCourses]);

  // Update loading state based on API loading - same as HomePage
  useEffect(() => {
    console.log('🔄 CoursesPage Loading State:', {
      apiLoading,
      localLoading: loading,
      allCoursesLength: allCourses.length,
      apiError
    });

    if (!apiLoading) {
      setLoading(false);
    }
  }, [apiLoading, allCourses, apiError]);

  // Get unique categories from courses - same as HomePage
  const allCategories = Array.from(new Set(allCourses.map(course => course.category)))
    .map(categoryName => ({ id: categoryName, name: categoryName }));

  // Show all courses including coming soon courses - same as HomePage
  const availableCourses = allCourses.filter(course => {
    // Show all courses, including coming soon courses
    return true;
  });

  // Debug logging for coming soon courses
  useEffect(() => {
    console.log('🔍 CoursesPage: Courses loaded:', {
      totalCourses: allCourses.length,
      comingSoonCourses: allCourses.filter(c => c.comingSoon).map(c => ({
        id: c.id,
        title: c.title,
        comingSoon: c.comingSoon
      }))
    });
  }, [allCourses]);

  const filteredCourses = selectedCategory === 'all'
    ? availableCourses
    : availableCourses.filter(course => course.category === selectedCategory);

  // Debug logging for filtered courses
  console.log('🎨 CoursesPage Filtered Courses:', {
    selectedCategory,
    totalFiltered: filteredCourses.length,
    filteredCourseDetails: filteredCourses.map(c => ({
      id: c.id,
      title: c.title,
      comingSoon: c.comingSoon,
      lessonsCount: c.lessons?.length || 0,
    }))
  });

  // Show loading state
  if (loading) {
    console.log('🎬 CoursesPage: Showing loading state');
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading courses...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    console.log('🎬 CoursesPage: Showing error state');
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Courses</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show empty state
  if (allCourses.length === 0) {
    console.log('🎬 CoursesPage: Showing empty state');
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="text-gray-500 text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-white mb-2">No Courses Available</h2>
              <p className="text-gray-400">Check back later for new courses!</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('🎬 CoursesPage: Rendering courses grid with', filteredCourses.length, 'courses');

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">All Courses</h1>
          <p className="text-gray-400 text-base md:text-lg max-w-3xl">
            Explore our comprehensive collection of courses taught by world-class experts.
            Master new skills and advance your career with hands-on learning experiences.
          </p>
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm md:text-base transition-colors ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Courses
          </button>
          {allCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm md:text-base transition-colors ${
                selectedCategory === category.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Course Grid - Separated by rows */}
        <div className="space-y-8">
          {(() => {
            const cardsPerRow = 5;
            const rows = [];

            for (let i = 0; i < filteredCourses.length; i += cardsPerRow) {
              const rowCourses = filteredCourses.slice(i, i + cardsPerRow);
              const rowIndex = Math.floor(i / cardsPerRow);

              rows.push(
                <div key={rowIndex} className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6 md:gap-4 lg:gap-8 card-grid-container`} data-row-id={rowIndex}>
                  {rowCourses.map(course => (
                    <CourseCard key={course.id} course={course} rowId={rowIndex} />
                  ))}
                </div>
              );
            }

            return rows;
          })()}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-white text-xl font-medium mb-2">No courses found</h3>
            <p className="text-gray-400">
              No courses are currently available in this category.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CoursesPage;
