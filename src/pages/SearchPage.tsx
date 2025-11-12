import React, { useState, useEffect } from 'react';
import { useSearchParams } from '../lib/router';
import { Search as SearchIcon, X, Filter, Sparkles, BookOpen, Users, TrendingUp, Clock, Star, ChevronDown, Check } from 'lucide-react';
import { courseAPI, categoryAPI, instructorAPI } from '../lib/api';
import CourseCard from '../components/ui/CourseCard';
import InstructorCard from '../components/ui/InstructorCard';
import Layout from '../components/layout/Layout';
import { Course, Category, Instructor } from '../types';

/**
 * SearchPage Component
 *
 * Modern, intuitive search interface with multi-select filtering.
 *
 * Features:
 * - Hero search section with prominent search bar
 * - Multi-select dropdown filtering
 * - Real-time search suggestions
 * - Responsive grid layouts
 * - Clear visual hierarchy
 * - Accessibility-focused design
 *
 * @component
 * @example
 * ```tsx
 * <SearchPage />
 * ```
 */

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [searchResults, setSearchResults] = useState({
    courses: [] as Course[],
    instructors: [] as Instructor[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [coursesData, categoriesData, instructorsData] = await Promise.all([
          courseAPI.getAllCourses(),
          categoryAPI.getAllCategories(),
          instructorAPI.getAllInstructors()
        ]);

        const coursesArr: Course[] = Array.isArray(coursesData) ? (coursesData as Course[]) : [];
        const categoriesArr: Category[] = Array.isArray(categoriesData) ? (categoriesData as Category[]) : [];
        const instructorsArr: Instructor[] = Array.isArray(instructorsData) ? (instructorsData as Instructor[]) : [];

        setAllCourses(coursesArr);
        setAllCategories(categoriesArr);
        setAllInstructors(instructorsArr);
        setSearchResults({
          courses: coursesArr,
          instructors: instructorsArr,
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load search data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, allCourses, allInstructors]);

  const performSearch = (query: string, coursesToSearch = allCourses, instructorsToSearch = allInstructors) => {
    if (!query.trim()) {
      setSearchResults({
        courses: coursesToSearch,
        instructors: instructorsToSearch,
      });
      return;
    }

    const lowercaseQuery = query.toLowerCase();

    const filteredCourses = coursesToSearch.filter(course => {
      // DUAL FALLBACK instructor handling - same logic as admin page
      let instructorName = 'Unknown Instructor';

      try {
        // First: Try to access the transformed instructor object (from useCourses hook)
        if (course.instructor && typeof course.instructor === 'object' && course.instructor !== null) {
          instructorName = (course.instructor as any).name || 'Unknown Instructor';
        }
        // Second: Fall back to raw API field (direct from API)
        else if ((course as any).instructor_name) {
          instructorName = (course as any).instructor_name || 'Unknown Instructor';
        }
        // Third: Handle string instructor (legacy format)
        else if (typeof course.instructor === 'string') {
          instructorName = course.instructor;
        }
        // Fourth: Final fallback
        else {
          instructorName = 'Unknown Instructor';
        }
      } catch (error) {
        console.error('Error accessing instructor data:', error);
        instructorName = 'Unknown Instructor';
      }

      return course.title.toLowerCase().includes(lowercaseQuery) ||
        course.description.toLowerCase().includes(lowercaseQuery) ||
        instructorName.toLowerCase().includes(lowercaseQuery) ||
        course.category.toLowerCase().includes(lowercaseQuery);
    });

    const filteredInstructors = instructorsToSearch.filter(instructor =>
      instructor.name.toLowerCase().includes(lowercaseQuery) ||
      instructor.title.toLowerCase().includes(lowercaseQuery) ||
      instructor.bio.toLowerCase().includes(lowercaseQuery) ||
      (instructor.expertise && instructor.expertise.some((skill: string) =>
        skill.toLowerCase().includes(lowercaseQuery)
      ))
    );

    setSearchResults({
      courses: filteredCourses,
      instructors: filteredInstructors,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
    setSearchParams({ q: searchQuery });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setSearchResults({
      courses: allCourses,
      instructors: allInstructors,
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = allCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getFilterIcon = (filter: string) => {
    switch (filter) {
      case 'all':
        return <Filter className="w-5 h-5" />;
      case 'courses':
        return <BookOpen className="w-5 h-5" />;
      case 'instructors':
        return <Users className="w-5 h-5" />;
      default:
        return <Filter className="w-5 h-5" />;
    }
  };

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case 'all':
        return 'All Results';
      case 'courses':
        return 'Courses';
      case 'instructors':
        return 'Instructors';
      default:
        return getCategoryName(filter);
    }
  };

  const handleFilterToggle = (filter: string) => {
    if (filter === 'all') {
      setSelectedFilters(['all']);
    } else {
      setSelectedFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        if (prev.includes(filter)) {
          return newFilters.length > 0 ? newFilters : ['all'];
        } else {
          return [...newFilters, filter];
        }
      });
    }
  };

  const getDisplayText = () => {
    if (selectedFilters.includes('all') || selectedFilters.length === 0) {
      return 'All Filters';
    }
    if (selectedFilters.length === 1) {
      return getFilterLabel(selectedFilters[0]);
    }
    return `${selectedFilters.length} filters selected`;
  };

  const isFilterActive = (filter: string) => {
    return selectedFilters.includes(filter) || (selectedFilters.includes('all') && filter === 'all');
  };

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <span className="ml-4 text-white text-lg">Loading search data...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 py-8">
          <div className="text-center py-20">
            <h3 className="text-white text-2xl font-medium mb-4">Error Loading Data</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-8">
        {/* Search Header */}
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-white text-4xl font-bold mb-8 text-center">Search</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative max-w-3xl w-full">
            <div className="relative flex">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for courses, instructors, or topics..."
                  className="bg-gray-800 w-full pl-10 pr-16 py-4 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-14 flex items-center pr-3"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-white" />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(true)}
                className="flex items-center space-x-2 px-4 py-4 bg-gray-800 text-white rounded-r-md hover:bg-gray-700 transition-colors border-l border-gray-600"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">{getDisplayText()}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Filter Popup Modal */}
        {isFilterDropdownOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-lg font-semibold">Filter Results</h3>
                  <button
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* All Results Option */}
                <div className="mb-6">
                  <label className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes('all')}
                      onChange={() => handleFilterToggle('all')}
                      className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-300 font-medium">All Results</span>
                  </label>
                </div>

                {/* Content Type Filters */}
                <div className="mb-6">
                  <h4 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">Content Type</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isFilterActive('courses')}
                        onChange={() => handleFilterToggle('courses')}
                        className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">Courses</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isFilterActive('instructors')}
                        onChange={() => handleFilterToggle('instructors')}
                        className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">Instructors</span>
                    </label>
                  </div>
                </div>

                {/* Category Filters */}
                {allCategories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">Categories</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {allCategories.map(category => (
                        <label key={category.id} className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={isFilterActive(category.id)}
                            onChange={() => handleFilterToggle(category.id)}
                            className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                          />
                          <span className="text-gray-300">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={() => {
                      setSelectedFilters(['all']);
                      setIsFilterDropdownOpen(false);
                    }}
                    className="flex-1 px-4 py-2 text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Instructors Section */}
          {(selectedFilters.includes('all') || selectedFilters.includes('instructors')) && (
            <div className="mb-16">
              <h2 className="text-white text-2xl font-bold mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-red-400" />
                Instructors
              </h2>
              {searchResults.instructors.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {searchResults.instructors.map(instructor => (
                    <InstructorCard key={instructor.id} instructor={instructor} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No instructors found matching your search.</p>
              )}
            </div>
          )}

          {/* Courses Section */}
          {(selectedFilters.includes('all') || selectedFilters.includes('courses') || selectedFilters.some(filter => allCategories.some(c => c.id === filter))) && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-red-400" />
                Courses
              </h2>
              {searchResults.courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {searchResults.courses
                    .filter(course =>
                      selectedFilters.includes('all') ||
                      selectedFilters.includes('courses') ||
                      selectedFilters.includes(course.category)
                    )
                    .map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                </div>
              ) : (
                <p className="text-gray-400">No courses found matching your search.</p>
              )}
            </div>
          )}

          {/* No Results */}
          {searchQuery &&
            selectedFilters.includes('all') &&
            searchResults.courses.length === 0 &&
            searchResults.instructors.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-white text-2xl font-medium mb-4">No results found</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                We couldn't find anything matching "{searchQuery}". Try adjusting your search terms or browse our categories.
              </p>
              <button
                onClick={clearSearch}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
