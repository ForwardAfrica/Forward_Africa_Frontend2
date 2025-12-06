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
        <div className="min-h-screen bg-brand-background-gradient py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-deepPurple/30 border-t-brand-deepPurple"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-brand-vibrantPink/20"></div>
            </div>
            <span className="mt-6 text-brand-textLight text-lg font-medium">Loading search data...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-brand-background-gradient py-8">
          <div className="text-center py-20 px-4">
            <div className="max-w-md mx-auto">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-deepPurple/20">
                <X className="w-10 h-10 text-brand-deepPurple" />
              </div>
              <h3 className="text-brand-textLight text-2xl font-bold mb-4">Error Loading Data</h3>
              <p className="text-brand-textGray max-w-md mx-auto mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-brand-deepPurple to-brand-vibrantPink text-white px-8 py-3 rounded-lg hover:shadow-brand-glow transition-all duration-300 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const totalResults = searchResults.courses.length + searchResults.instructors.length;
  const hasActiveFilters = !selectedFilters.includes('all') && selectedFilters.length > 0;

  return (
    <Layout>
      <div className="min-h-screen bg-brand-background-gradient relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-deepPurple/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-vibrantPink/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Hero Search Section - Single Row Layout */}
          <div className="pt-8 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Single Row Layout */}
              <form onSubmit={handleSearch} className="relative">
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  {/* Title and Subtitle Section */}
                  <div className="flex-shrink-0 min-w-[200px]">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                      Discover Learning
                    </h1>
                    <p className="text-white/80 text-xs md:text-sm">
                      Search through our extensive library of courses and expert instructors
                    </p>
                  </div>

                  {/* Search Input Container */}
                  <div className="flex-1 min-w-[250px] relative group">
                    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden shadow-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-white" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for courses, instructors, or topics..."
                        className="bg-transparent w-full pl-10 pr-10 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="absolute inset-y-0 right-10 flex items-center pr-2 text-white/70 hover:text-white transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg whitespace-nowrap"
                  >
                    <SearchIcon className="w-5 h-5" />
                    <span>Search</span>
                  </button>

                  {/* Filter Button */}
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(true)}
                    className={`px-5 py-3 bg-white/10 backdrop-blur-sm border rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap ${
                      hasActiveFilters
                        ? 'border-white text-white shadow-lg'
                        : 'border-white/30 text-white hover:border-white hover:bg-white/10'
                    }`}
                  >
                    <Filter className="w-5 h-5" />
                    <span className="hidden sm:inline">{getDisplayText()}</span>
                    {hasActiveFilters && (
                      <span className="ml-2 px-2 py-0.5 bg-white text-gray-900 text-xs rounded-full font-bold">
                        {selectedFilters.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Results Count */}
              {searchQuery && (
                <div className="mt-6 text-center">
                  <p className="text-brand-textGray">
                    {totalResults > 0 ? (
                      <span>
                        Found <span className="text-brand-deepPurple font-semibold">{totalResults}</span> {totalResults === 1 ? 'result' : 'results'}
                      </span>
                    ) : (
                      <span>No results found</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Filter Popup Modal */}
          {isFilterDropdownOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200"
              onClick={() => setIsFilterDropdownOpen(false)}
            >
              <div 
                className="bg-brand-surface border border-brand-deepPurple/30 rounded-2xl shadow-brand-glow max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-brand-deepPurple/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-brand-textLight text-xl font-bold">Filter Results</h3>
                      <p className="text-brand-textGray text-sm mt-1">Refine your search</p>
                    </div>
                    <button
                      onClick={() => setIsFilterDropdownOpen(false)}
                      className="text-brand-textGray hover:text-brand-textLight transition-colors p-2 hover:bg-brand-surfaceMuted rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Filter Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* All Results Option */}
                  <div>
                    <label className="flex items-center space-x-3 p-4 hover:bg-brand-surfaceMuted rounded-xl cursor-pointer transition-colors border border-transparent hover:border-brand-deepPurple/20">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes('all')}
                          onChange={() => handleFilterToggle('all')}
                          className="w-5 h-5 text-brand-deepPurple bg-brand-surfaceMuted border-brand-deepPurple/30 rounded focus:ring-brand-deepPurple focus:ring-2"
                        />
                        {selectedFilters.includes('all') && (
                          <Check className="absolute inset-0 w-5 h-5 text-brand-deepPurple pointer-events-none" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-brand-textLight font-medium">All Results</span>
                        <p className="text-brand-textGray text-sm">Show everything</p>
                      </div>
                    </label>
                  </div>

                  {/* Content Type Filters */}
                  <div>
                    <h4 className="text-brand-textGray text-sm font-semibold mb-3 uppercase tracking-wide flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Content Type
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 p-4 hover:bg-brand-surfaceMuted rounded-xl cursor-pointer transition-colors border border-transparent hover:border-brand-deepPurple/20">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isFilterActive('courses')}
                            onChange={() => handleFilterToggle('courses')}
                            className="w-5 h-5 text-brand-deepPurple bg-brand-surfaceMuted border-brand-deepPurple/30 rounded focus:ring-brand-deepPurple focus:ring-2"
                          />
                          {isFilterActive('courses') && (
                            <Check className="absolute inset-0 w-5 h-5 text-brand-deepPurple pointer-events-none" />
                          )}
                        </div>
                        <BookOpen className="w-5 h-5 text-brand-deepPurple" />
                        <span className="text-brand-textLight">Courses</span>
                      </label>
                      <label className="flex items-center space-x-3 p-4 hover:bg-brand-surfaceMuted rounded-xl cursor-pointer transition-colors border border-transparent hover:border-brand-deepPurple/20">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={isFilterActive('instructors')}
                            onChange={() => handleFilterToggle('instructors')}
                            className="w-5 h-5 text-brand-deepPurple bg-brand-surfaceMuted border-brand-deepPurple/30 rounded focus:ring-brand-deepPurple focus:ring-2"
                          />
                          {isFilterActive('instructors') && (
                            <Check className="absolute inset-0 w-5 h-5 text-brand-deepPurple pointer-events-none" />
                          )}
                        </div>
                        <Users className="w-5 h-5 text-brand-deepPurple" />
                        <span className="text-brand-textLight">Instructors</span>
                      </label>
                    </div>
                  </div>

                  {/* Category Filters */}
                  {allCategories.length > 0 && (
                    <div>
                      <h4 className="text-brand-textGray text-sm font-semibold mb-3 uppercase tracking-wide flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Categories
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                        {allCategories.map(category => (
                          <label 
                            key={category.id} 
                            className="flex items-center space-x-3 p-4 hover:bg-brand-surfaceMuted rounded-xl cursor-pointer transition-colors border border-transparent hover:border-brand-deepPurple/20"
                          >
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isFilterActive(category.id)}
                                onChange={() => handleFilterToggle(category.id)}
                                className="w-5 h-5 text-brand-deepPurple bg-brand-surfaceMuted border-brand-deepPurple/30 rounded focus:ring-brand-deepPurple focus:ring-2"
                              />
                              {isFilterActive(category.id) && (
                                <Check className="absolute inset-0 w-5 h-5 text-brand-deepPurple pointer-events-none" />
                              )}
                            </div>
                            <span className="text-brand-textLight">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-brand-deepPurple/20 flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedFilters(['all']);
                      setIsFilterDropdownOpen(false);
                    }}
                    className="flex-1 px-4 py-3 text-brand-textGray hover:text-brand-textLight hover:bg-brand-surfaceMuted rounded-xl transition-all duration-200 font-medium"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-deepPurple to-brand-vibrantPink text-white rounded-xl hover:shadow-brand-glow transition-all duration-300 font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            {/* Instructors Section */}
            {(selectedFilters.includes('all') || selectedFilters.includes('instructors')) && searchResults.instructors.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-brand-textLight text-3xl font-bold flex items-center">
                    <div className="mr-3 p-2 bg-gradient-to-r from-brand-deepPurple/20 to-brand-vibrantPink/20 rounded-lg">
                      <Users className="w-6 h-6 text-brand-deepPurple" />
                    </div>
                    Instructors
                    <span className="ml-3 text-brand-textGray text-lg font-normal">
                      ({searchResults.instructors.length})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {searchResults.instructors.map(instructor => (
                    <InstructorCard key={instructor.id} instructor={instructor} />
                  ))}
                </div>
              </div>
            )}

            {/* Courses Section */}
            {(selectedFilters.includes('all') || selectedFilters.includes('courses') || selectedFilters.some(filter => allCategories.some(c => c.id === filter))) && searchResults.courses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-brand-textLight text-3xl font-bold flex items-center">
                    <div className="mr-3 p-2 bg-gradient-to-r from-brand-deepPurple/20 to-brand-vibrantPink/20 rounded-lg">
                      <BookOpen className="w-6 h-6 text-brand-deepPurple" />
                    </div>
                    Courses
                    <span className="ml-3 text-brand-textGray text-lg font-normal">
                      ({searchResults.courses.filter(course =>
                        selectedFilters.includes('all') ||
                        selectedFilters.includes('courses') ||
                        selectedFilters.includes(course.category)
                      ).length})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              </div>
            )}

            {/* Empty States */}
            {searchQuery && totalResults === 0 && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-brand-deepPurple/20 to-brand-vibrantPink/20">
                    <SearchIcon className="w-12 h-12 text-brand-deepPurple" />
                  </div>
                  <h3 className="text-brand-textLight text-3xl font-bold mb-4">No results found</h3>
                  <p className="text-brand-textGray text-lg mb-8">
                    We couldn't find anything matching <span className="text-brand-deepPurple font-semibold">"{searchQuery}"</span>. Try adjusting your search terms or browse our categories.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={clearSearch}
                      className="px-6 py-3 bg-gradient-to-r from-brand-deepPurple to-brand-vibrantPink text-white rounded-xl hover:shadow-brand-glow transition-all duration-300 font-medium"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => setIsFilterDropdownOpen(true)}
                      className="px-6 py-3 bg-brand-surface border border-brand-deepPurple/30 text-brand-textLight rounded-xl hover:border-brand-deepPurple hover:shadow-brand-glow transition-all duration-300 font-medium"
                    >
                      Adjust Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Initial Empty State - No Search Query */}
            {!searchQuery && totalResults === 0 && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-brand-deepPurple/20 to-brand-vibrantPink/20">
                    <Sparkles className="w-12 h-12 text-brand-deepPurple" />
                  </div>
                  <h3 className="text-brand-textLight text-2xl font-bold mb-4">Start Your Search</h3>
                  <p className="text-brand-textGray">
                    Enter a search term above to discover courses and instructors
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
