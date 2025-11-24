/**
 * TypeScript type definitions for FirestoreService
 * Provides proper typing for the backend Firestore service
 */

export interface InstructorData {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  title?: string;
  email?: string;
  phone?: string;
  image?: string;
  expertise?: string[];
  experience?: number;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  courses_count?: number;
  created_at?: any;
  updated_at?: any;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

export interface CourseData {
  id: string;
  title?: string;
  description?: string;
  instructor_id?: string;
  category_name?: string;
  featured?: boolean;
  coming_soon?: boolean;
  created_at?: any;
  updated_at?: any;
  [key: string]: any;
}

export interface CategoryData {
  id: string;
  name: string;
  created_at?: any;
  updated_at?: any;
  [key: string]: any;
}

export interface CertificateData {
  id: string;
  user_id: string;
  course_id: string;
  course_title?: string;
  issued_at?: any;
  pdf_url?: string;
  [key: string]: any;
}

export interface AchievementData {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earned_at?: any;
  [key: string]: any;
}

export interface AuditLogData {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  details?: string;
  timestamp?: any;
  [key: string]: any;
}

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at?: any;
  [key: string]: any;
}

export interface UserData {
  id: string;
  email?: string;
  uid?: string;
  full_name?: string;
  displayName?: string;
  avatar_url?: string;
  photoURL?: string;
  created_at?: any;
  updated_at?: any;
  [key: string]: any;
}

export interface PlatformStats {
  totalUsers: number;
  totalCourses: number;
  totalInstructors: number;
  totalCertificates: number;
  activeUsers: number;
  completedCourses: number;
  totalLessons: number;
  totalXP: number;
}

declare class FirestoreService {
  // Courses
  static getCourses(limitCount?: number, lastDocId?: string | null): Promise<CourseData[]>;
  static getCourseById(courseId: string): Promise<CourseData | null>;
  static createCourse(courseData: Partial<CourseData>): Promise<string>;
  static updateCourse(courseId: string, courseData: Partial<CourseData>): Promise<void>;
  static deleteCourse(courseId: string): Promise<void>;
  static getFeaturedCourses(): Promise<CourseData[]>;
  static getAllCourses(includeComingSoon?: boolean): Promise<CourseData[]>;
  static getCoursesByInstructor(instructorId: string, includeComingSoon?: boolean): Promise<CourseData[]>;
  static getCoursesByCategory(category: string, includeComingSoon?: boolean): Promise<CourseData[]>;

  // Instructors
  static getInstructors(): Promise<InstructorData[]>;
  static getInstructorById(instructorId: string): Promise<InstructorData | null>;
  static createInstructor(instructorData: Partial<InstructorData>): Promise<string>;
  static updateInstructor(instructorId: string, instructorData: Partial<InstructorData>): Promise<void>;
  static deleteInstructor(instructorId: string): Promise<void>;
  static getInstructorByEmail(email: string): Promise<InstructorData | null>;

  // Categories
  static getCategories(): Promise<CategoryData[]>;
  static createCategory(categoryData: Partial<CategoryData>): Promise<CategoryData>;

  // Certificates
  static getUserCertificates(userId: string): Promise<CertificateData[]>;
  static createCertificate(certificateData: Partial<CertificateData>): Promise<string>;

  // Achievements
  static getUserAchievements(userId: string): Promise<AchievementData[]>;

  // Notifications
  static getUserNotifications(userId: string): Promise<NotificationData[]>;
  static markNotificationAsRead(userId: string, notificationId: string): Promise<void>;

  // Audit Logs
  static createAuditLog(auditData: Partial<AuditLogData>): Promise<string>;
  static getAuditLogs(limitCount?: number): Promise<AuditLogData[]>;

  // Users
  static getUserData(userId: string): Promise<UserData | null>;
  static updateUserData(userId: string, userData: Partial<UserData>): Promise<void>;
  static createUserData(userId: string, userData: Partial<UserData>): Promise<void>;
  static getUsers(): Promise<UserData[]>;

  // Progress
  static getUserProgress(userId: string, courseId: string): Promise<any[]>;
  static updateUserProgress(userId: string, courseId: string, lessonId: string, progressData: any): Promise<void>;
  static markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<void>;
  static batchUpdateUserProgress(userId: string, courseId: string, progressUpdates: any[]): Promise<void>;

  // Analytics
  static getPlatformStats(): Promise<PlatformStats>;

  // Helpers
  static enrichCourseWithInstructor(course: CourseData): Promise<CourseData>;
  static enrichCoursesWithInstructors(courses: CourseData[]): Promise<CourseData[]>;
}

export default FirestoreService;
