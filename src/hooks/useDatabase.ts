// Custom hook for database operations
// This hook provides easy access to database operations throughout the app

import { useState, useEffect, useCallback } from 'react';
import { courseAPI, categoryAPI, instructorAPI, progressAPI, certificateAPI, achievementAPI, analyticsAPI, userAPI, auditLogsAPI } from '../lib/api';
import { Course, Category, Instructor, UserProgress, Certificate, Achievement } from '../types';

// Custom hook for courses
export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCourses = useCallback(async (includeComingSoon = true) => {
    console.log('🔄 useDatabase: fetchAllCourses called with includeComingSoon:', includeComingSoon);
    setLoading(true);
    setError(null);

    try {
      console.log('📡 useDatabase: Making API call to getAllCourses...');
      const response = await courseAPI.getAllCourses(includeComingSoon);

      // Extract data array from response - handle both wrapped and unwrapped responses
      let dataArray: any[] = [];
      if (Array.isArray(response)) {
        dataArray = response as any[];
      } else if (response && response.data && Array.isArray(response.data)) {
        dataArray = response.data as any[];
      } else if (response && response.data && Array.isArray(response.data)) {
        dataArray = response.data as any[];
      }

      const first = dataArray[0] as any | undefined;
      console.log('✅ useDatabase: API call successful, received data:', {
        dataLength: dataArray.length,
        dataType: typeof response,
        isArray: Array.isArray(response),
        hasDataProperty: response?.data !== undefined,
        firstItem: first ? { id: first.id, title: first.title, coming_soon: first.coming_soon } : null
      });

      // Transform backend data to frontend format with dual fallback logic
      console.log('🔄 useDatabase: Starting data transformation...');
      const transformedCourses = dataArray.map((course: any) => {
        console.log('🎯 useDatabase: Transforming course:', {
          id: course.id,
          title: course.title,
          coming_soon: course.coming_soon,
          instructor_name: course.instructor_name,
          lessons_count: course.lessons?.length || 0
        });

        // DUAL FALLBACK instructor handling - same logic as admin page
        let instructorName = 'Unknown Instructor';
        let instructorTitle = 'Instructor';
        let instructorImage = '/images/placeholder-avatar.jpg';
        let instructorBio = 'Experienced instructor';
        let instructorEmail = 'instructor@forwardafrica.com';
        let instructorExpertise = ['Education'];
        let instructorExperience = 5;
        let instructorCreatedAt = new Date();

        try {
          // First: Try to access the transformed instructor object (from useCourses hook)
          if (course.instructor && typeof course.instructor === 'object' && course.instructor !== null) {
            instructorName = (course.instructor as any).name || 'Unknown Instructor';
            instructorTitle = (course.instructor as any).title || 'Instructor';
            instructorImage = (course.instructor as any).image || '/images/placeholder-avatar.jpg';
            instructorBio = (course.instructor as any).bio || 'Experienced instructor';
            instructorEmail = (course.instructor as any).email || 'instructor@forwardafrica.com';
            instructorExpertise = (course.instructor as any).expertise || ['Education'];
            instructorExperience = (course.instructor as any).experience || 5;
            instructorCreatedAt = new Date((course.instructor as any).createdAt || Date.now());
          }
          // Second: Fall back to raw API field (direct from API)
          else if (course.instructor_name) {
            instructorName = course.instructor_name || 'Unknown Instructor';
            instructorTitle = course.instructor_title || 'Instructor';
            instructorImage = course.instructor_image || '/images/placeholder-avatar.jpg';
            instructorBio = course.instructor_bio || 'Experienced instructor';
            instructorEmail = course.instructor_email || 'instructor@forwardafrica.com';
            instructorExpertise = course.instructor_expertise ? JSON.parse(course.instructor_expertise) : ['Education'];
            instructorExperience = course.instructor_experience || 5;
            instructorCreatedAt = new Date(course.instructor_created_at || Date.now());
          }
          // Third: Handle string instructor (legacy format)
          else if (typeof course.instructor === 'string') {
            instructorName = course.instructor;
            instructorTitle = 'Instructor';
            instructorImage = '/images/placeholder-avatar.jpg';
            instructorBio = 'Experienced instructor';
            instructorEmail = 'instructor@forwardafrica.com';
            instructorExpertise = ['Education'];
            instructorExperience = 5;
            instructorCreatedAt = new Date();
          }
          // Fourth: Final fallback
          else {
            instructorName = 'Unknown Instructor';
            instructorTitle = 'Instructor';
            instructorImage = '/images/placeholder-avatar.jpg';
            instructorBio = 'Experienced instructor';
            instructorEmail = 'instructor@forwardafrica.com';
            instructorExpertise = ['Education'];
            instructorExperience = 5;
            instructorCreatedAt = new Date();
          }
        } catch (error) {
          console.error('Error accessing instructor data:', error);
          instructorName = 'Unknown Instructor';
          instructorTitle = 'Instructor';
          instructorImage = '/images/placeholder-avatar.jpg';
          instructorBio = 'Experienced instructor';
          instructorEmail = 'instructor@forwardafrica.com';
          instructorExpertise = ['Education'];
          instructorExperience = 5;
          instructorCreatedAt = new Date();
        }

        const transformed = {
          id: course.id,
          title: course.title,
          instructor: {
            id: course.instructor_id || 'unknown',
            name: instructorName,
            title: instructorTitle,
            image: instructorImage,
            bio: instructorBio,
            email: instructorEmail,
            expertise: instructorExpertise,
            experience: instructorExperience,
            createdAt: instructorCreatedAt
          },
          instructorId: course.instructor_id,
          category: course.category_name || course.category || 'General',
          thumbnail: course.thumbnail || '/images/placeholder-course.jpg',
          banner: course.banner || '/images/placeholder-course.jpg',
          videoUrl: course.video_url,
          description: course.description || 'Course description coming soon.',
          lessons: course.lessons || [],
          featured: course.featured || false,
          totalXP: course.total_xp || 1000,
          comingSoon: course.coming_soon === 1 || course.coming_soon === true,
          releaseDate: course.release_date
        };

        console.log('✅ useDatabase: Course transformed:', {
          id: transformed.id,
          title: transformed.title,
          comingSoon: transformed.comingSoon,
          lessonsCount: transformed.lessons.length
        });

        return transformed;
      });

      console.log('🎉 useDatabase: All courses transformed successfully:', {
        totalCourses: transformedCourses.length,
        comingSoonCount: transformedCourses.filter((c: Course) => c.comingSoon).length,
        regularCount: transformedCourses.filter((c: Course) => !c.comingSoon).length
      });

      setCourses(transformedCourses);
    } catch (err) {
      console.error('��� useDatabase: Failed to fetch courses from API:', err);
      setError('Failed to load courses from server');
      setCourses([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedCourses = useCallback(async () => {
    try {
      const data = await courseAPI.getFeaturedCourses();
      const dataArray: any[] = Array.isArray(data) ? (data as any[]) : ([] as any[]);

      // Transform backend data to frontend format with dual fallback logic
      const transformedCourses = dataArray.map((course: any) => {
        // DUAL FALLBACK instructor handling - same logic as admin page
        let instructorName = 'Unknown Instructor';
        let instructorTitle = 'Instructor';
        let instructorImage = '/images/placeholder-avatar.jpg';
        let instructorBio = 'Experienced instructor';
        let instructorEmail = 'instructor@forwardafrica.com';
        let instructorExpertise = ['Education'];
        let instructorExperience = 5;
        let instructorCreatedAt = new Date();

        try {
          // First: Try to access the transformed instructor object (from useCourses hook)
          if (course.instructor && typeof course.instructor === 'object' && course.instructor !== null) {
            instructorName = (course.instructor as any).name || 'Unknown Instructor';
            instructorTitle = (course.instructor as any).title || 'Instructor';
            instructorImage = (course.instructor as any).image || '/images/placeholder-avatar.jpg';
            instructorBio = (course.instructor as any).bio || 'Experienced instructor';
            instructorEmail = (course.instructor as any).email || 'instructor@forwardafrica.com';
            instructorExpertise = (course.instructor as any).expertise || ['Education'];
            instructorExperience = (course.instructor as any).experience || 5;
            instructorCreatedAt = new Date((course.instructor as any).createdAt || Date.now());
          }
          // Second: Fall back to raw API field (direct from API)
          else if (course.instructor_name) {
            instructorName = course.instructor_name || 'Unknown Instructor';
            instructorTitle = course.instructor_title || 'Instructor';
            instructorImage = course.instructor_image || '/images/placeholder-avatar.jpg';
            instructorBio = course.instructor_bio || 'Experienced instructor';
            instructorEmail = course.instructor_email || 'instructor@forwardafrica.com';
            instructorExpertise = course.instructor_expertise ? JSON.parse(course.instructor_expertise) : ['Education'];
            instructorExperience = course.instructor_experience || 5;
            instructorCreatedAt = new Date(course.instructor_created_at || Date.now());
          }
          // Third: Handle string instructor (legacy format)
          else if (typeof course.instructor === 'string') {
            instructorName = course.instructor;
            instructorTitle = 'Instructor';
            instructorImage = '/images/placeholder-avatar.jpg';
            instructorBio = 'Experienced instructor';
            instructorEmail = 'instructor@forwardafrica.com';
            instructorExpertise = ['Education'];
            instructorExperience = 5;
            instructorCreatedAt = new Date();
          }
          // Fourth: Final fallback
          else {
            instructorName = 'Unknown Instructor';
            instructorTitle = 'Instructor';
            instructorImage = '/images/placeholder-avatar.jpg';
            instructorBio = 'Experienced instructor';
            instructorEmail = 'instructor@forwardafrica.com';
            instructorExpertise = ['Education'];
            instructorExperience = 5;
            instructorCreatedAt = new Date();
          }
        } catch (error) {
          console.error('Error accessing instructor data:', error);
          instructorName = 'Unknown Instructor';
          instructorTitle = 'Instructor';
          instructorImage = '/images/placeholder-avatar.jpg';
          instructorBio = 'Experienced instructor';
          instructorEmail = 'instructor@forwardafrica.com';
          instructorExpertise = ['Education'];
          instructorExperience = 5;
          instructorCreatedAt = new Date();
        }

        return {
          id: course.id,
          title: course.title,
          instructor: {
            id: course.instructor_id || 'unknown',
            name: instructorName,
            title: instructorTitle,
            image: instructorImage,
            bio: instructorBio,
            email: instructorEmail,
            expertise: instructorExpertise,
            experience: instructorExperience,
            createdAt: instructorCreatedAt
          },
          instructorId: course.instructor_id,
          category: course.category_name || course.category || 'General',
          thumbnail: course.thumbnail || '/images/placeholder-course.jpg',
          banner: course.banner || '/images/placeholder-course.jpg',
          videoUrl: course.video_url,
          description: course.description || 'Course description coming soon.',
          lessons: course.lessons || [],
          featured: course.featured || false,
          totalXP: course.total_xp || 1000,
          comingSoon: course.coming_soon === 1 || course.coming_soon === true,
          releaseDate: course.release_date
        };
      });

      setFeaturedCourses(transformedCourses);
    } catch (err) {
      console.error('Failed to fetch featured courses from API:', err);
      setFeaturedCourses([]); // Set empty array instead of mock data
    }
  }, []);

  return {
    courses,
    featuredCourses,
    loading,
    error,
    fetchAllCourses,
    fetchFeaturedCourses
  };
};



// Custom hook for audit logs
export const useAuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async (filters?: {
    action?: string;
    resource_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('��� Fetching audit logs...');
      const data = await auditLogsAPI.getAuditLogs(filters);
      console.log('📋 Audit logs received:', data);

      // Handle both array and object responses
      const logsArray = Array.isArray(data) ? data : (data.logs || data.data || []);
      setLogs(logsArray);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Failed to load audit logs. Please check your authentication and try again.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAuditLog = useCallback(async (auditData: {
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: any;
  }) => {
    try {
      await auditLogsAPI.createAuditLog(auditData);
      // Refresh logs after creating new one
      await fetchAuditLogs();
    } catch (err) {
      console.error('Failed to create audit log:', err);
      throw err;
    }
  }, [fetchAuditLogs]);

  return {
    logs,
    loading,
    error,
    fetchAuditLogs,
    createAuditLog
  };
};

// Custom hook for categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryAPI.getAllCategories();

      // Normalize different possible response shapes from apiRequest/mocked backend
      // Possible shapes: Category[], null, { success: boolean } or { data: Category[] }
      let categoriesArray: Category[] = [];

      if (Array.isArray(data)) {
        categoriesArray = data as Category[];
      } else if (data && typeof data === 'object') {
        // If the API returns an object with a `data` or `categories` property
        if (Array.isArray((data as any).data)) {
          categoriesArray = (data as any).data as Category[];
        } else if (Array.isArray((data as any).categories)) {
          categoriesArray = (data as any).categories as Category[];
        } else {
          // fallback: leave as empty array
          categoriesArray = [];
        }
      } else {
        categoriesArray = [];
      }

      setCategories(categoriesArray);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchAllCategories
  };
};

// Custom hook for instructors
export const useInstructors = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllInstructors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await instructorAPI.getAllInstructors();

      // Normalize different possible response shapes
      // Possible shapes: Instructor[], null, { success: boolean } or { data: Instructor[] } or { instructors: Instructor[] }
      let instructorsArray: Instructor[] = [];

      if (Array.isArray(data)) {
        instructorsArray = data as Instructor[];
      } else if (data && typeof data === 'object') {
        if (Array.isArray((data as any).data)) {
          instructorsArray = (data as any).data as Instructor[];
        } else if (Array.isArray((data as any).instructors)) {
          instructorsArray = (data as any).instructors as Instructor[];
        } else {
          instructorsArray = [];
        }
      } else {
        instructorsArray = [];
      }

      setInstructors(instructorsArray);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
      setError('Failed to load instructors');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    instructors,
    loading,
    error,
    fetchAllInstructors
  };
};

// Hook for managing user progress
export const useUserProgress = (userId: string) => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProgress = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await progressAPI.getAllUserProgress(userId);
      const dataArray = Array.isArray(data) ? data : [];
      setProgress(dataArray);
    } catch (err) {
      setError('Failed to fetch user progress');
      console.error('Error fetching user progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProgress = useCallback(async (courseId: string, progressData: Partial<UserProgress>) => {
    setLoading(true);
    setError(null);
    try {
      await progressAPI.updateProgress(userId, courseId, progressData);
      await fetchUserProgress(); // Refresh data
    } catch (err) {
      setError('Failed to update progress');
      console.error('Error updating progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchUserProgress]);

  const createProgress = useCallback(async (progressData: Partial<UserProgress>) => {
    setLoading(true);
    setError(null);
    try {
      await progressAPI.createProgress(progressData);
      await fetchUserProgress(); // Refresh data
    } catch (err) {
      setError('Failed to create progress');
      console.error('Error creating progress:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProgress]);

  return {
    progress,
    loading,
    error,
    fetchUserProgress,
    updateProgress,
    createProgress,
  };
};

// Hook for managing certificates
export const useCertificates = (userId: string) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCertificates = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await certificateAPI.getUserCertificates(userId);

      // Normalize response shapes: Certificate[] | null | { data: Certificate[] } | { certificates: Certificate[] }
      let certificatesArray: Certificate[] = [];
      if (Array.isArray(data)) {
        certificatesArray = data as Certificate[];
      } else if (data && typeof data === 'object') {
        if (Array.isArray((data as any).data)) {
          certificatesArray = (data as any).data as Certificate[];
        } else if (Array.isArray((data as any).certificates)) {
          certificatesArray = (data as any).certificates as Certificate[];
        }
      }

      setCertificates(certificatesArray);
    } catch (err) {
      setError('Failed to fetch certificates');
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const verifyCertificate = useCallback(async (verificationCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await certificateAPI.verifyCertificate(verificationCode);
      return data;
    } catch (err) {
      setError('Failed to verify certificate');
      console.error('Error verifying certificate:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    certificates,
    loading,
    error,
    fetchUserCertificates,
    verifyCertificate,
  };
};

// Hook for managing achievements
export const useAchievements = (userId: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAchievements = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await achievementAPI.getUserAchievements(userId);

      // Normalize response shapes: Achievement[] | null | { data: Achievement[] } | { achievements: Achievement[] }
      let achievementsArray: Achievement[] = [];
      if (Array.isArray(data)) {
        achievementsArray = data as Achievement[];
      } else if (data && typeof data === 'object') {
        if (Array.isArray((data as any).data)) {
          achievementsArray = (data as any).data as Achievement[];
        } else if (Array.isArray((data as any).achievements)) {
          achievementsArray = (data as any).achievements as Achievement[];
        }
      }

      setAchievements(achievementsArray);
    } catch (err) {
      setError('Failed to fetch achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    achievements,
    loading,
    error,
    fetchUserAchievements,
  };
};

// Hook for managing users
export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]); // Changed to any[] as User type is removed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
          try {
        const data = await userAPI.getUsers();
        const dataArray = Array.isArray(data) ? data : [];
        setUsers(dataArray);
      } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserById = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
          try {
        const data = await userAPI.getUser(userId);
        return data;
      } catch (err) {
      setError('Failed to fetch user');
      console.error('Error fetching user:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: Partial<any>) => { // Changed to any
    setLoading(true);
    setError(null);
          try {
        const result = await userAPI.createUser(userData);
        await fetchAllUsers(); // Refresh data
        return result;
      } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAllUsers]);

  const updateUser = useCallback(async (userId: string, userData: Partial<any>) => { // Changed to any
    setLoading(true);
    setError(null);
          try {
        await userAPI.updateUser(userId, userData);
        await fetchAllUsers(); // Refresh data
      } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAllUsers]);

  return {
    users,
    loading,
    error,
    fetchAllUsers,
    fetchUserById,
    createUser,
    updateUser,
  };
};

// Hook for platform analytics
export const useAnalytics = () => {
  const [stats, setStats] = useState<any>(null);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatformStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Fetching platform stats...');
      const data = await analyticsAPI.getPlatformStats();
      console.log('📊 Platform stats received:', data);
      setStats(data);
    } catch (err) {
      // Handle authentication error gracefully
      if (err instanceof Error && err.message === 'Authentication required') {
        console.log('📊 Platform stats require authentication - using fallback data');
        setError(null); // Don't show error for auth requirement
      } else {
        setError('Failed to fetch platform stats');
        console.error('Error fetching platform stats:', err);
      }

      // Set fallback data for unauthenticated users
      setStats({
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalCertificates: 0,
        totalInstructors: 0,
        completedCourses: 0,
        activeStudents: 0,
        totalXP: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetailedAnalytics = useCallback(async () => {
    try {
      console.log('📈 Fetching detailed analytics...');
      const data = await analyticsAPI.getDetailedAnalytics();
      console.log('📈 Detailed analytics received:', data);
      setDetailedStats(data);
    } catch (err) {
      console.error('Failed to fetch detailed analytics:', err);
      setError('Failed to load detailed analytics');
    }
  }, []);

  return {
    stats,
    detailedStats,
    loading,
    error,
    fetchPlatformStats,
    fetchDetailedAnalytics,
  };
};

// Example usage in components:
/*
import { useCourses, useUserProgress } from '../hooks/useDatabase';

const HomePage = () => {
  const { featuredCourses, loading, fetchFeaturedCourses } = useCourses();
  const { progress, fetchUserProgress } = useUserProgress(userId);

  useEffect(() => {
    fetchFeaturedCourses();
    fetchUserProgress();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {featuredCourses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
*/
