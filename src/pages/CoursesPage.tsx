import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import CourseCard from '../components/ui/CourseCard';
import { useCourses, useCategories } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';

const CoursesPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NOTE: Removed manual token redirect checks
  // AuthContext now handles all authentication redirects
  // No need to check token here - ProtectedRoute or AuthContext will handle it

  // Database hooks - same as HomePage
  const {
    courses: allCourses,
    loading: apiLoading,
    error: apiError,
    fetchAllCourses
  } = useCourses();

  // Fetch all categories from API
  const {
    categories: allCategoriesFromAPI,
    loading: categoriesLoading,
    error: categoriesError,
    fetchAllCategories
  } = useCategories();

  // Fetch data only if authenticated
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch courses and categories from API
        await Promise.all([
          fetchAllCourses(),
          fetchAllCategories()
        ]);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data from server');
        setLoading(false);
      }
    };

    loadData();
  }, [fetchAllCourses, fetchAllCategories, authLoading, isAuthenticated]);

  // Update loading state based on API loading - same as HomePage
  useEffect(() => {
    console.log('🔄 CoursesPage Loading State:', {
      apiLoading,
      categoriesLoading,
      authLoading,
      localLoading: loading,
      allCoursesLength: allCourses.length,
      allCategoriesLength: allCategoriesFromAPI.length,
      apiError,
      categoriesError
    });

    if (!apiLoading && !categoriesLoading && !authLoading) {
      setLoading(false);
    }
  }, [apiLoading, categoriesLoading, authLoading, allCourses, allCategoriesFromAPI, apiError, categoriesError]);

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

  // Filter courses by selected category
  // Match by category name or category id
  const filteredCourses = selectedCategory === 'all'
    ? availableCourses
    : availableCourses.filter(course => {
        // Match by category name (from course.category) or by category id
        const selectedCategoryData = allCategoriesFromAPI.find(cat => cat.id === selectedCategory || cat.name === selectedCategory);
        if (selectedCategoryData) {
          return course.category === selectedCategoryData.name || course.category === selectedCategoryData.id;
        }
        return course.category === selectedCategory;
      });

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

  // Show blank loading state while checking authentication - prevent showing content to unauthenticated users
  if (authLoading) {
    console.log('🎬 CoursesPage: Checking authentication...');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state for courses data
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

        {/* Category Filter - Display all categories from API */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
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
            {allCategoriesFromAPI.map(category => (
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
          {allCategoriesFromAPI.length === 0 && !categoriesLoading && (
            <p className="text-gray-400 text-sm mt-2">No categories available</p>
          )}
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
