// API Service for Database Operations
// This service handles all HTTP requests to your backend server

import { API_BASE_URL } from './mysql';
import { Course, Category, Instructor, User, UserProgress, Certificate, Achievement } from '../types';
import {
  getAllInstructorsFromFirestore,
  getInstructorFromFirestore,
  createInstructorInFirestore,
  updateInstructorInFirestore,
  deleteInstructorFromFirestore
} from './firestoreInstructors';

// Generic API request function with authentication
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Backend removed — return mock data to keep UI functional.
  console.warn('API request intercepted (backend removed). Returning mock for:', endpoint, options?.method || 'GET');

  const method = (options.method || 'GET').toUpperCase();

  // Heuristic mocks
  // List endpoints -> return empty array
  if (/\/(users|courses|categories|instructors|lessons)(?:$|\?|\/|$)/.test(endpoint)) {
    if (/\/(users|courses)\/[^/]+/.test(endpoint)) {
      // single resource
      return null;
    }
    return [];
  }

  if (method === 'GET') return null;
  return { success: true };
};

// User API
export const userAPI = {
  // Get all users
  getUsers: () => apiRequest('/users'),

  // Get user by ID
  getUser: (userId: string) => apiRequest(`/users/${userId}`),

  // Get user by email
  getUserByEmail: (email: string) => apiRequest(`/users/email/${email}`),

  // Create new user
  createUser: (userData: Partial<User>) =>
    apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Update user
  updateUser: (userId: string, userData: Partial<User>) =>
    apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // Delete user
  deleteUser: (userId: string) =>
    apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    }),
};

// Course API
export const courseAPI = {
  // Get all courses
  getAllCourses: (includeComingSoon = true) =>
    apiRequest(`/courses${includeComingSoon ? '?include_coming_soon=true' : ''}`),

  // Get course by ID
  getCourse: (courseId: string) => apiRequest(`/courses/${courseId}`),

  // Get featured courses
  getFeaturedCourses: (includeComingSoon = true) =>
    apiRequest(`/courses/featured${includeComingSoon ? '?include_coming_soon=true' : ''}`),

  // Get courses by category
  getCoursesByCategory: (categoryId: string, includeComingSoon = false) =>
    apiRequest(`/courses/category/${categoryId}${includeComingSoon ? '?include_coming_soon=true' : ''}`),

  // Create new course
  createCourse: (courseData: Partial<Course>) =>
    apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),

  // Update course
  updateCourse: (courseId: string, courseData: Partial<Course>) =>
    apiRequest(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }),

  // Delete course
  deleteCourse: (courseId: string) =>
    apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
    }),

  // Search courses
  searchCourses: (query: string, options?: { limit?: number; offset?: number; includeComingSoon?: boolean }) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.includeComingSoon) params.append('include_coming_soon', 'true');
    return apiRequest(`/search?${params.toString()}`);
  },
};

// Category API
export const categoryAPI = {
  // Get all categories
  getAllCategories: () => apiRequest('/categories'),

  // Get category by ID
  getCategory: (categoryId: string) => apiRequest(`/categories/${categoryId}`),

  // Create new category
  createCategory: (categoryData: Partial<Category>) =>
    apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    }),

  // Update category
  updateCategory: (categoryId: string, categoryData: Partial<Category>) =>
    apiRequest(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    }),

  // Delete category
  deleteCategory: (categoryId: string) =>
    apiRequest(`/categories/${categoryId}`, {
      method: 'DELETE',
    }),
};

// Instructor API
// Uses Firestore for persistence instead of HTTP backend
export const instructorAPI = {
  // Get all instructors
  getAllInstructors: async () => {
    try {
      return await getAllInstructorsFromFirestore();
    } catch (error) {
      console.error('Failed to fetch instructors from Firestore:', error);
      return [];
    }
  },

  // Get instructor by ID
  getInstructor: async (instructorId: string) => {
    try {
      return await getInstructorFromFirestore(instructorId);
    } catch (error) {
      console.error('Failed to fetch instructor from Firestore:', error);
      return null;
    }
  },

  // Get instructor courses
  getInstructorCourses: (instructorId: string, includeComingSoon = false) =>
    apiRequest(`/instructors/${instructorId}/courses${includeComingSoon ? '?include_coming_soon=true' : ''}`),

  // Create new instructor
  createInstructor: async (instructorData: Partial<Instructor>) => {
    try {
      // Get JWT token from cookie (secure HTTP-only cookie)
      const token = typeof window !== 'undefined'
        ? authService.getToken()
        : null;

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Call API endpoint instead of directly using Firestore
      // This uses the Admin SDK on the backend, which bypasses Firestore rules
      const response = await fetch('/api/instructors/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: instructorData.name || '',
          title: instructorData.title || '',
          email: instructorData.email || '',
          phone: instructorData.phone,
          bio: instructorData.bio || '',
          image: instructorData.image || '',
          experience: instructorData.experience || 0,
          expertise: instructorData.expertise || [],
          socialLinks: instructorData.socialLinks
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create instructor`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Failed to create instructor:', error);
      throw error;
    }
  },

  // Update instructor
  updateInstructor: async (instructorId: string, instructorData: Partial<Instructor>) => {
    try {
      return await updateInstructorInFirestore(instructorId, instructorData);
    } catch (error) {
      console.error('Failed to update instructor in Firestore:', error);
      throw error;
    }
  },

  // Delete instructor
  deleteInstructor: async (instructorId: string) => {
    try {
      await deleteInstructorFromFirestore(instructorId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete instructor from Firestore:', error);
      throw error;
    }
  },
};

// User Progress API
export const progressAPI = {
  // Get user progress for a course
  getUserProgress: (userId: string, courseId: string) =>
    apiRequest(`/progress/${userId}/${courseId}`),

  // Get all user progress
  getAllUserProgress: (userId: string) => apiRequest(`/progress/${userId}`),

  // Update user progress
  updateProgress: (userId: string, courseId: string, progressData: Partial<UserProgress>) =>
    apiRequest(`/progress/${userId}/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    }),

  // Create user progress
  createProgress: (progressData: Partial<UserProgress>) =>
    apiRequest('/progress', {
      method: 'POST',
      body: JSON.stringify(progressData),
    }),
};

// Certificate API
export const certificateAPI = {
  // Get user certificates
  getUserCertificates: (userId: string) => apiRequest(`/certificates/${userId}`),

  // Get certificate by ID
  getCertificate: (certificateId: string) => apiRequest(`/certificates/id/${certificateId}`),

  // Verify certificate
  verifyCertificate: (verificationCode: string) =>
    apiRequest(`/certificates/verify/${verificationCode}`),

  // Create certificate
  createCertificate: (certificateData: Partial<Certificate>) =>
    apiRequest('/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    }),
};

// Achievement API
export const achievementAPI = {
  // Get user achievements
  getUserAchievements: (userId: string) => apiRequest(`/achievements/${userId}`),

  // Create achievement
  createAchievement: (achievementData: Partial<Achievement>) =>
    apiRequest('/achievements', {
      method: 'POST',
      body: JSON.stringify(achievementData),
    }),

  // Update achievement progress
  updateAchievementProgress: (achievementId: string, progress: number) =>
    apiRequest(`/achievements/${achievementId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    }),
};

// Analytics API
export const analyticsAPI = {
  // Get platform statistics
  getPlatformStats: () => apiRequest('/analytics/platform'),

  // Get detailed analytics
  getDetailedAnalytics: () => apiRequest('/analytics/detailed'),

  // Get user statistics
  getUserStats: (userId: string) => apiRequest(`/analytics/user/${userId}`),

  // Get course statistics
  getCourseStats: (courseId: string) => apiRequest(`/analytics/course/${courseId}`),
};

// Audit Logs API
export const auditLogsAPI = {
  // Get all audit logs with optional filtering
  getAuditLogs: async (filters?: {
    action?: string;
    resource_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          // Map frontend parameter names to backend parameter names
          if (key === 'user_id') {
            params.append('userId', value.toString());
          } else if (key === 'limit') {
            params.append('limit', value.toString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/audit-logs?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Audit logs API response:', data);

      // Handle the secureRoutes response format which includes logs and pagination
      if (data.logs && Array.isArray(data.logs)) {
        return data.logs;
      }

      // Handle direct array response (fallback)
      if (Array.isArray(data)) {
        return data;
      }

      // Handle other response formats
      return data.logs || data.data || [];
    } catch (error) {
      console.error('📋 Audit logs API error:', error);
      throw error;
    }
  },

  // Create audit log
  createAuditLog: async (auditData: {
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: any;
  }) => {
    try {
      const token = localStorage.getItem('forward_africa_token');
      const response = await fetch(`${API_BASE_URL}/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(auditData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('📋 Create audit log API error:', error);
      throw error;
    }
  },
};

// Export all APIs
export const api = {
  user: userAPI,
  course: courseAPI,
  category: categoryAPI,
  instructor: instructorAPI,
  progress: progressAPI,
  certificate: certificateAPI,
  achievement: achievementAPI,
  analytics: analyticsAPI,
  auditLogs: auditLogsAPI,
};
