import { Course, Instructor, Category } from '../types';

// Search result types
export interface SearchResult {
  id: string;
  type: 'course' | 'instructor' | 'lesson' | 'transcript';
  title: string;
  description: string;
  relevance: number;
  highlights: string[];
  metadata: Record<string, any>;
}

export interface SearchFilters {
  category?: string;
  instructor?: string;
  difficulty?: string;
  duration?: string;
  rating?: number;
  price?: string;
  language?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasTranscript?: boolean;
  hasSubtitles?: boolean;
  isFree?: boolean;
  isFeatured?: boolean;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'popularity' | 'rating' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Note: Mock data removed - now using real data from database
// Transcript data and course content will be fetched from the database

class SearchService {
  private courses: Course[] = [];
  private instructors: Instructor[] = [];
  private categories: Category[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // In a real app, this would load from API/database
    // For now, we'll use mock data
  }

  // Set data sources
  setData(courses: Course[], instructors: Instructor[], categories: Category[]) {
    this.courses = courses;
    this.instructors = instructors;
    this.categories = categories;
  }

  // Full-text search across all content
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, filters = {}, limit = 20, offset = 0, sortBy = 'relevance', sortOrder = 'desc' } = options;

    if (!query.trim()) {
      return [];
    }

    const results: SearchResult[] = [];
    const lowercaseQuery = query.toLowerCase();
    const queryWords = this.tokenizeQuery(lowercaseQuery);

    // Search courses
    const courseResults = this.searchCourses(queryWords, filters);
    results.push(...courseResults);

    // Search instructors
    const instructorResults = this.searchInstructors(queryWords, filters);
    results.push(...instructorResults);

    // Search lessons
    const lessonResults = this.searchLessons(queryWords, filters);
    results.push(...lessonResults);

    // Search transcripts
    const transcriptResults = this.searchTranscripts(queryWords, filters);
    results.push(...transcriptResults);

    // Sort results
    const sortedResults = this.sortResults(results, sortBy, sortOrder);

    // Apply pagination
    return sortedResults.slice(offset, offset + limit);
  }

  // Tokenize search query for better matching
  private tokenizeQuery(query: string): string[] {
    return query
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2);
  }

  // Search courses with full-text capabilities
  private searchCourses(queryWords: string[], filters: SearchFilters): SearchResult[] {
    return this.courses
      .map(course => {
        let relevance = 0;
        const highlights: string[] = [];

        // Search in title
        const titleMatch = this.calculateWordMatch(queryWords, course.title.toLowerCase());
        if (titleMatch.score > 0) {
          relevance += titleMatch.score * 3; // Title matches are weighted higher
          highlights.push(`Title: ${titleMatch.highlight}`);
        }

        // Search in description
        const descMatch = this.calculateWordMatch(queryWords, course.description.toLowerCase());
        if (descMatch.score > 0) {
          relevance += descMatch.score * 2;
          highlights.push(`Description: ${descMatch.highlight}`);
        }

        // Search in lessons
        const lessonMatches = (course.lessons?.map(lesson => {
          const lessonMatch = this.calculateWordMatch(queryWords, lesson.title.toLowerCase());
          if (lessonMatch.score > 0) {
            return `Lesson: ${lessonMatch.highlight}`;
          }
          return null;
        }).filter(Boolean) as string[]) || [];

        highlights.push(...lessonMatches);

        // Apply filters
        if (!this.applyFilters(course, {}, filters)) {
          return null;
        }

        if (relevance > 0) {
          return {
            id: course.id,
            type: 'course' as const,
            title: course.title,
            description: course.description,
            relevance,
            highlights,
            metadata: {
              instructor: course.instructor,
              category: course.category,
              thumbnail: course.thumbnail,
              lessons: course.lessons.length,
              featured: course.featured,
              ...courseContent
            }
          };
        }

        return null;
      })
      .filter(Boolean) as SearchResult[];
  }

  // Search instructors
  private searchInstructors(queryWords: string[], filters: SearchFilters): SearchResult[] {
    return this.instructors
      .map(instructor => {
        let relevance = 0;
        const highlights: string[] = [];

        // Search in name
        const nameMatch = this.calculateWordMatch(queryWords, instructor.name.toLowerCase());
        if (nameMatch.score > 0) {
          relevance += nameMatch.score * 3;
          highlights.push(`Name: ${nameMatch.highlight}`);
        }

        // Search in title
        const titleMatch = this.calculateWordMatch(queryWords, instructor.title.toLowerCase());
        if (titleMatch.score > 0) {
          relevance += titleMatch.score * 2;
          highlights.push(`Title: ${titleMatch.highlight}`);
        }

        // Search in bio
        const bioMatch = this.calculateWordMatch(queryWords, instructor.bio.toLowerCase());
        if (bioMatch.score > 0) {
          relevance += bioMatch.score;
          highlights.push(`Bio: ${bioMatch.highlight}`);
        }

        // Search in expertise
        const expertiseMatch = this.calculateTagMatch(queryWords, instructor.expertise);
        if (expertiseMatch.score > 0) {
          relevance += expertiseMatch.score * 1.5;
          highlights.push(`Expertise: ${expertiseMatch.highlight}`);
        }

        if (relevance > 0) {
          return {
            id: instructor.id,
            type: 'instructor' as const,
            title: instructor.name,
            description: instructor.title,
            relevance,
            highlights,
            metadata: {
              bio: instructor.bio,
              expertise: instructor.expertise,
              image: instructor.image,
              experience: instructor.experience
            }
          };
        }

        return null;
      })
      .filter(Boolean) as SearchResult[];
  }

  // Search lessons
  private searchLessons(queryWords: string[], filters: SearchFilters): SearchResult[] {
    const results: SearchResult[] = [];

    this.courses.forEach(course => {
      course.lessons.forEach(lesson => {
        let relevance = 0;
        const highlights: string[] = [];

        // Search in lesson title
        const titleMatch = this.calculateWordMatch(queryWords, lesson.title.toLowerCase());
        if (titleMatch.score > 0) {
          relevance += titleMatch.score * 3;
          highlights.push(`Lesson: ${titleMatch.highlight}`);
        }

        // Search in lesson description
        const descMatch = this.calculateWordMatch(queryWords, lesson.description.toLowerCase());
        if (descMatch.score > 0) {
          relevance += descMatch.score * 2;
          highlights.push(`Description: ${descMatch.highlight}`);
        }

        if (relevance > 0) {
          results.push({
            id: lesson.id,
            type: 'lesson' as const,
            title: lesson.title,
            description: lesson.description,
            relevance,
            highlights,
            metadata: {
              courseId: course.id,
              courseTitle: course.title,
              duration: lesson.duration,
              thumbnail: lesson.thumbnail,
              xpPoints: lesson.xpPoints
            }
          });
        }
      });
    });

    return results;
  }

  // Search transcripts
  private searchTranscripts(queryWords: string[], filters: SearchFilters): SearchResult[] {
    // Note: Transcript search removed - will be implemented when real transcript data is available
    // For now, return empty array as we're using real data only
    return [];
  }

  // Calculate word match relevance
  private calculateWordMatch(queryWords: string[], text: string): { score: number; highlight: string } {
    let score = 0;
    let highlight = '';

    queryWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);

      if (matches) {
        score += matches.length;

        // Create highlight
        const index = text.toLowerCase().indexOf(word);
        if (index !== -1) {
          const start = Math.max(0, index - 20);
          const end = Math.min(text.length, index + word.length + 20);
          highlight = `...${text.substring(start, end)}...`;
        }
      }
    });

    return { score, highlight };
  }

  // Calculate tag match relevance
  private calculateTagMatch(queryWords: string[], tags: string[]): { score: number; highlight: string } {
    let score = 0;
    const matchedTags: string[] = [];

    queryWords.forEach(word => {
      tags.forEach(tag => {
        if (tag.toLowerCase().includes(word)) {
          score += 1;
          matchedTags.push(tag);
        }
      });
    });

    return {
      score,
      highlight: matchedTags.join(', ')
    };
  }

  // Apply search filters
  private applyFilters(course: Course, courseContent: any, filters: SearchFilters): boolean {
    if (filters.category && course.category !== filters.category) {
      return false;
    }

    if (filters.instructor && course.instructor.id !== filters.instructor) {
      return false;
    }

    if (filters.difficulty && courseContent.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.duration && courseContent.duration !== filters.duration) {
      return false;
    }

    if (filters.rating && courseContent.rating < filters.rating) {
      return false;
    }

    if (filters.language && courseContent.language !== filters.language) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const courseTags = courseContent.tags || [];
      const hasMatchingTag = filters.tags.some(tag => courseTags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    if (filters.hasTranscript && !courseContent.hasTranscript) {
      return false;
    }

    if (filters.hasSubtitles && !courseContent.hasSubtitles) {
      return false;
    }

    if (filters.isFree !== undefined && courseContent.isFree !== filters.isFree) {
      return false;
    }

    if (filters.isFeatured !== undefined && courseContent.isFeatured !== filters.isFeatured) {
      return false;
    }

    return true;
  }

  // Sort search results
  private sortResults(results: SearchResult[], sortBy: string, sortOrder: string): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.relevance - a.relevance;
          break;
        case 'popularity':
          comparison = (b.metadata.popularity || 0) - (a.metadata.popularity || 0);
          break;
        case 'rating':
          comparison = (b.metadata.rating || 0) - (a.metadata.rating || 0);
          break;
        case 'date':
          comparison = new Date(b.metadata.createdAt || 0).getTime() - new Date(a.metadata.createdAt || 0).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = b.relevance - a.relevance;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }

  // Get search suggestions
  async getSuggestions(query: string, limit: number = 8): Promise<string[]> {
    if (!query.trim()) {
      return [];
    }

    const suggestions = new Set<string>();
    const lowercaseQuery = query.toLowerCase();

    // Add course titles
    this.courses.forEach(course => {
      if (course.title.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(course.title);
      }
    });

    // Add instructor names
    this.instructors.forEach(instructor => {
      if (instructor.name.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(instructor.name);
      }
    });

    // Add category names
    this.categories.forEach(category => {
      if (category.name.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(category.name);
      }
    });

    // Add tags
    Object.values(mockCourseContent).forEach(content => {
      content.tags?.forEach((tag: string) => {
        if (tag.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Get popular searches
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    // In a real app, this would come from analytics
    return [
      'business fundamentals',
      'entrepreneurship',
      'marketing strategy',
      'financial management',
      'leadership skills',
      'digital marketing',
      'startup funding',
      'business strategy',
      'team management',
      'innovation'
    ].slice(0, limit);
  }

  // Get search analytics
  async getSearchAnalytics(): Promise<{
    totalSearches: number;
    popularQueries: Array<{ query: string; count: number }>;
    searchTrends: Array<{ date: string; searches: number }>;
  }> {
    // Mock analytics data
    return {
      totalSearches: 15420,
      popularQueries: [
        { query: 'business fundamentals', count: 1247 },
        { query: 'entrepreneurship', count: 892 },
        { query: 'marketing', count: 756 },
        { query: 'finance', count: 634 },
        { query: 'leadership', count: 521 }
      ],
      searchTrends: [
        { date: '2024-01-01', searches: 120 },
        { date: '2024-01-02', searches: 145 },
        { date: '2024-01-03', searches: 132 },
        { date: '2024-01-04', searches: 167 },
        { date: '2024-01-05', searches: 189 }
      ]
    };
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService;
