import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSearchParams } from '../lib/router';
import { Search as SearchIcon, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { courseAPI, categoryAPI, instructorAPI } from '../lib/api';
import CourseCard from '../components/ui/CourseCard';
import InstructorCard from '../components/ui/InstructorCard';
import Layout from '../components/layout/Layout';
import { Course, Category, Instructor } from '../types';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'course' | 'instructor' | 'category' | 'tag';
  relevance: number;
}

const EnhancedSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [searchResults, setSearchResults] = useState({
    courses: [] as Course[],
    instructors: [] as Instructor[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  // Perform search with full-text capabilities
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ courses: allCourses, instructors: allInstructors });
      return;
    }

    setLoading(true);

    try {
      const lowercaseQuery = query.toLowerCase();

      // Filter courses
      const filteredCourses = allCourses.filter(course => {
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

      // Filter instructors
      const filteredInstructors = allInstructors.filter(instructor =>
        instructor.name.toLowerCase().includes(lowercaseQuery) ||
        instructor.title.toLowerCase().includes(lowercaseQuery) ||
        instructor.bio.toLowerCase().includes(lowercaseQuery) ||
        (instructor.expertise && instructor.expertise.some((skill: string) =>
          skill.toLowerCase().includes(lowercaseQuery)
        ))
      );

      setSearchResults({ courses: filteredCourses, instructors: filteredInstructors });
      setSearchParams({ q: query });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ courses: [], instructors: [] });
    } finally {
      setLoading(false);
    }
  };

  // Handle search from advanced search component
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    performSearch(suggestion.text);
  };

  // Handle course selection from recommendations
  const handleCourseSelect = (course: Course) => {
    // Navigate to course page
    router.push(`/course/${course.id}`);
  };

  // Group results by type
  const groupedResults = {
    courses: searchResults.courses,
    instructors: searchResults.instructors,
    lessons: [], // No direct 'lesson' type in this search
    transcripts: [] // No direct 'transcript' type in this search
  };

  // Get result count by type
  const getResultCount = (type: string) => {
    return groupedResults[type as keyof typeof groupedResults].length;
  };

  // Get total results count
  const totalResults = groupedResults.courses.length + groupedResults.instructors.length;

  // Render search result item
  const renderSearchResult = (result: Course | Instructor) => {
    if ('title' in result && 'instructor' in result) { // Check if it's a Course
      return (
        <div key={result.id} className="relative">
          <CourseCard course={result as Course} />
        </div>
      );
    } else if ('name' in result && 'title' in result && 'bio' in result) { // It's an Instructor
      return (
        <div key={result.id} className="relative">
          <InstructorCard instructor={result as Instructor} />
        </div>
      );
    }
    return null;
  };

  // Show loading state
  if (loading && !searchQuery) {
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
        <div className="mb-12">
          <h1 className="text-white text-4xl font-bold mb-8">Advanced Search</h1>

          {/* Search Form */}
          <form onSubmit={(e) => { e.preventDefault(); performSearch(searchQuery); }} className="relative max-w-3xl mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for courses, instructors, or topics..."
                className="bg-gray-800 w-full pl-10 pr-16 py-4 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-14 flex items-center pr-3"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-red-600 rounded-r-md text-white font-medium hover:bg-red-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-white text-2xl font-bold">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-gray-400 mt-1">
                  {totalResults} results found
                </p>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    if (searchQuery) {
                      performSearch(searchQuery);
                    }
                  }}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="popularity">Popularity</option>
                  <option value="rating">Rating</option>
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                </select>

                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    if (searchQuery) {
                      performSearch(searchQuery);
                    }
                  }}
                  className="p-2 bg-gray-800 border border-gray-700 rounded-md text-white hover:bg-gray-700 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <SearchIcon className="h-4 w-4" />
                <span>All ({totalResults})</span>
              </button>
              <button
                onClick={() => setActiveFilter('courses')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'courses'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {/* <BookOpen className="h-4 w-4" /> */}
                <span>Courses ({getResultCount('courses')})</span>
              </button>
              <button
                onClick={() => setActiveFilter('instructors')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'instructors'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {/* <Users className="h-4 w-4" /> */}
                <span>Instructors ({getResultCount('instructors')})</span>
              </button>
              {/* <button
                onClick={() => setActiveFilter('lessons')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'lessons'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Lessons ({getResultCount('lessons')})</span>
              </button> */}
              {/* <button
                onClick={() => setActiveFilter('transcripts')}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  activeFilter === 'transcripts'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Transcripts ({getResultCount('transcripts')})</span>
              </button> */}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-400">Searching...</span>
              </div>
            )}

            {/* Results Grid */}
            {!loading && totalResults > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupedResults.courses
                  .filter(result => {
                    if (activeFilter === 'all') return true;
                    return activeFilter === 'courses'; // Only show courses
                  })
                  .map(renderSearchResult)}
                {groupedResults.instructors
                  .filter(result => {
                    if (activeFilter === 'all') return true;
                    return activeFilter === 'instructors'; // Only show instructors
                  })
                  .map(renderSearchResult)}
              </div>
            )}

            {/* No Results */}
            {!loading && totalResults === 0 && (
              <div className="text-center py-20">
                <SearchIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white text-2xl font-medium mb-4">No results found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                  We couldn't find anything matching "{searchQuery}". Try adjusting your search terms or browse our recommendations.
                </p>
                {/* <button
                  onClick={() => setShowRecommendations(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
                >
                  View Recommendations
                </button> */}
              </div>
            )}
          </div>
        )}

        {/* Recommendations Section */}
        {/* This section is no longer needed as recommendations are not integrated into the main search */}
        {/* <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-bold">Recommended for You</h2>
            <div className="flex items-center space-x-2 text-gray-400">
              <Zap className="h-4 w-4" />
              <span className="text-sm">AI-Powered Recommendations</span>
            </div>
          </div>

          <RecommendationEngine
            courses={allCourses}
            userProgress={userProgress}
            currentUser={currentUser}
            onCourseSelect={handleCourseSelect}
          />
        </div> */}

        {/* Search Analytics */}
        {searchQuery && totalResults > 0 && (
          <div className="mt-12 p-6 bg-gray-800 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Search Insights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-white font-semibold">{totalResults}</div>
                <div className="text-gray-400">Total Results</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">
                  {/* This calculation is not directly available from the new API response */}
                  {/* For now, we'll just show a placeholder or remove if not applicable */}
                  <span>N/A</span>
                </div>
                <div className="text-gray-400">Avg Relevance</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">
                  {/* This calculation is not directly available from the new API response */}
                  {/* For now, we'll just show a placeholder or remove if not applicable */}
                  <span>N/A</span>
                </div>
                <div className="text-gray-400">Content Types</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold">
                  {/* This calculation is not directly available from the new API response */}
                  {/* For now, we'll just show a placeholder or remove if not applicable */}
                  <span>N/A</span>
                </div>
                <div className="text-gray-400">Courses Found</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedSearchPage;
