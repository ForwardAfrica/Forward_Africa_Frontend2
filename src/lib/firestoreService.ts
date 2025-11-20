// Frontend Firestore Service - All operations now go through backend API endpoints
// The backend uses Firebase Admin SDK for secure, privileged database operations

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  banner: string;
  instructor: {
    id: string;
    name: string;
    bio: string;
    avatar: string;
    social_links: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  };
  facilitator_id?: string;
  lessons: Lesson[];
  featured: boolean;
  coming_soon: boolean;
  release_date?: Date;
  total_xp: number;
  created_at: any;
  updated_at: any;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration: number;
  order: number;
  is_completed: boolean;
  xp_reward: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  progress_percentage: number;
  time_spent: number;
  last_accessed: any;
  completed_at?: any;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: any;
}

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  social_links: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  courses_count: number;
  created_at: any;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string;
  issued_at: any;
  pdf_url?: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earned_at: any;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: any;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  details: string;
  ip_address: string;
  user_agent?: string;
  timestamp: any;
  resource_type?: string;
  resource_id?: string;
}

export class FirestoreService {
  // ============================================================================
  // COURSES
  // ============================================================================

  static async getCourses(limitCount: number = 20, lastDoc?: any): Promise<Course[]> {
    try {
      const limit = limitCount;
      const lastDocId = lastDoc?.id;
      
      const queryStr = lastDocId 
        ? `?limit=${limit}&lastDocId=${lastDocId}` 
        : `?limit=${limit}`;

      const response = await fetch(`/api/courses${queryStr}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw error;
    }
  }

  static async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      throw error;
    }
  }

  static async getCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const response = await fetch(`/api/courses/category/${encodeURIComponent(category)}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses by category: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching courses by category:', error);
      throw error;
    }
  }

  static async getFeaturedCourses(): Promise<Course[]> {
    try {
      const response = await fetch('/api/courses/featured', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch featured courses: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching featured courses:', error);
      throw error;
    }
  }

  static async createCourse(courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create course: ${response.statusText}`);
      }

      const data = await response.json();
      return data.courseId;
    } catch (error) {
      console.error('❌ Error creating course:', error);
      throw error;
    }
  }

  static async updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update course: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw error;
    }
  }

  static async deleteCourse(courseId: string): Promise<void> {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete course: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      throw error;
    }
  }

  // ============================================================================
  // USER PROGRESS
  // ============================================================================

  static async getUserProgress(userId: string, courseId: string): Promise<UserProgress[]> {
    try {
      const response = await fetch(`/api/progress/${userId}/${courseId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user progress: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching user progress:', error);
      throw error;
    }
  }

  static async updateUserProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    progressData: Partial<UserProgress>
  ): Promise<void> {
    try {
      const response = await fetch(`/api/progress/${userId}/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonId, progressData })
      });

      if (!response.ok) {
        throw new Error(`Failed to update user progress: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error updating user progress:', error);
      throw error;
    }
  }

  static async markLessonComplete(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<void> {
    try {
      const response = await fetch(`/api/progress/${userId}/${courseId}/${lessonId}/complete`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to mark lesson as complete: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error marking lesson complete:', error);
      throw error;
    }
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  static async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch('/api/categories', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  }

  // ============================================================================
  // INSTRUCTORS
  // ============================================================================

  static async getInstructors(): Promise<Instructor[]> {
    try {
      const response = await fetch('/api/instructors', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch instructors: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching instructors:', error);
      throw error;
    }
  }

  static async getInstructorById(instructorId: string): Promise<Instructor | null> {
    try {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch instructor: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('❌ Error fetching instructor:', error);
      throw error;
    }
  }

  // ============================================================================
  // CERTIFICATES
  // ============================================================================

  static async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const response = await fetch(`/api/certificates/${userId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch certificates: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching certificates:', error);
      throw error;
    }
  }

  static async createCertificate(certificateData: Omit<Certificate, 'id' | 'issued_at'>): Promise<string> {
    try {
      const userId = certificateData.user_id;
      const response = await fetch(`/api/certificates/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(certificateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create certificate: ${response.statusText}`);
      }

      const data = await response.json();
      return data.certificateId;
    } catch (error) {
      console.error('❌ Error creating certificate:', error);
      throw error;
    }
  }

  // ============================================================================
  // ACHIEVEMENTS
  // ============================================================================

  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const response = await fetch(`/api/achievements/${userId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching achievements:', error);
      throw error;
    }
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await fetch(`/api/notifications/${userId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/notifications/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId })
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  static async createAuditLog(auditData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const response = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(auditData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create audit log: ${response.statusText}`);
      }

      const data = await response.json();
      return data.logId;
    } catch (error) {
      console.error('❌ Error creating audit log:', error);
      throw error;
    }
  }

  static async getAuditLogs(limitCount: number = 100): Promise<AuditLog[]> {
    try {
      const response = await fetch(`/api/audit-logs?limit=${limitCount}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching audit logs:', error);
      throw error;
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  static async batchUpdateUserProgress(
    userId: string,
    courseId: string,
    progressUpdates: { lessonId: string; progressData: Partial<UserProgress> }[]
  ): Promise<void> {
    try {
      // Execute updates sequentially through individual API calls
      // For batch operations, you can implement a dedicated endpoint if needed
      for (const update of progressUpdates) {
        await this.updateUserProgress(userId, courseId, update.lessonId, update.progressData);
      }
    } catch (error) {
      console.error('❌ Error batch updating user progress:', error);
      throw error;
    }
  }

  // ============================================================================
  // REAL-TIME LISTENERS (No longer supported via REST API)
  // ============================================================================
  // Real-time listeners (onSnapshot, subscribeToUserProgress, etc.) are not 
  // supported through REST API. For real-time updates, you would need to:
  // 1. Implement WebSocket endpoints on the backend
  // 2. Use polling with regular fetch calls
  // 3. Use a service like Firebase Cloud Messaging for push notifications
}
