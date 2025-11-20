/**
 * Core type definitions for the application
 */

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  onboarding_completed: boolean;
}

// Role Definitions - EXACT strings from database, NO normalization
export type UserRole = 'Super Admin' | 'Instructor' | 'Content Manager' | 'Community Manager' | 'User Support' | 'user';

// Workflow Types
export type WorkflowStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export interface Workflow {
  id: string;
  content_id: string;
  content_type: 'course' | 'lesson' | 'video';
  status: WorkflowStatus;
  current_reviewer_id: string;
  review_notes: string;
  review_deadline: string;
  published_at: string;
  archived_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowHistory {
  id: string;
  workflow_id: string;
  from_status?: WorkflowStatus;
  to_status: WorkflowStatus;
  changed_by: string;
  changed_by_name?: string;
  notes?: string;
  created_at: string;
}

// Permission Types
export type Permission =
  // System Management
  | 'system:full_access'
  | 'system:configuration'
  | 'system:maintenance'
  | 'system:backup'

  // User Management
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'users:assign_roles'
  | 'users:suspend'
  | 'users:activate'

  // Content Management
  | 'content:upload'
  | 'content:edit'
  | 'content:delete'
  | 'content:publish'
  | 'content:review'
  | 'content:workflow'

  // Course Management
  | 'courses:view'
  | 'courses:create'
  | 'courses:edit'
  | 'courses:delete'
  | 'courses:publish'
  | 'courses:assign_instructors'

  // Instructor Management
  | 'instructors:view'
  | 'instructors:create'
  | 'instructors:edit'
  | 'instructors:delete'
  | 'instructors:approve'

  // Community Management
  | 'community:moderate'
  | 'community:ban_users'
  | 'community:delete_posts'
  | 'community:pin_posts'
  | 'community:analytics'

  // Support Management
  | 'support:view_tickets'
  | 'support:respond_tickets'
  | 'support:escalate_tickets'
  | 'support:close_tickets'

  // Financial & Analytics
  | 'analytics:view'
  | 'analytics:export'
  | 'financial:view'
  | 'financial:export'
  | 'financial:refund'

  // Communication
  | 'communication:send_announcements'
  | 'communication:send_emails'
  | 'communication:send_notifications'

  // Audit & Security
  | 'audit:view_logs'
  | 'audit:export_logs'
  | 'security:view_sessions'
  | 'security:terminate_sessions';

// Role Permission Matrix - Using EXACT role strings from database
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'Super Admin': [
    // Full system access
    'system:full_access',
    'system:configuration',
    'system:maintenance',
    'system:backup',

    // All user management
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'users:assign_roles',
    'users:suspend',
    'users:activate',

    // All content management
    'content:upload',
    'content:edit',
    'content:delete',
    'content:publish',
    'content:review',
    'content:workflow',

    // All course management
    'courses:view',
    'courses:create',
    'courses:edit',
    'courses:delete',
    'courses:publish',
    'courses:assign_instructors',

    // All instructor management
    'instructors:view',
    'instructors:create',
    'instructors:edit',
    'instructors:delete',
    'instructors:approve',

    // All community management
    'community:moderate',
    'community:ban_users',
    'community:delete_posts',
    'community:pin_posts',
    'community:analytics',

    // All support management
    'support:view_tickets',
    'support:respond_tickets',
    'support:escalate_tickets',
    'support:close_tickets',

    // All analytics and financial
    'analytics:view',
    'analytics:export',
    'financial:view',
    'financial:export',
    'financial:refund',

    // All communication
    'communication:send_announcements',
    'communication:send_emails',
    'communication:send_notifications',

    // All audit and security
    'audit:view_logs',
    'audit:export_logs',
    'security:view_sessions',
    'security:terminate_sessions'
  ],

  'Instructor': [
    // Content management
    'content:upload',
    'content:edit',
    'content:delete',
    'content:publish',
    'content:review',
    'content:workflow',

    // Course management
    'courses:view',
    'courses:create',
    'courses:edit',
    'courses:delete',
    'courses:publish',
    'courses:assign_instructors',

    // Limited user management
    'users:view',
    'users:edit',

    // Basic analytics
    'analytics:view',

    // Communication
    'communication:send_announcements',
    'communication:send_notifications'
  ],

  'Content Manager': [
    // Content management
    'content:upload',
    'content:edit',
    'content:delete',
    'content:publish',
    'content:review',
    'content:workflow',

    // Course management
    'courses:view',
    'courses:create',
    'courses:edit',
    'courses:delete',
    'courses:publish',
    'courses:assign_instructors',

    // Instructor management
    'instructors:view',
    'instructors:create',
    'instructors:edit',
    'instructors:approve',

    // Limited user management
    'users:view',
    'users:edit',

    // Basic analytics
    'analytics:view',

    // Communication
    'communication:send_announcements',
    'communication:send_notifications'
  ],

  'Community Manager': [
    // Community management
    'community:moderate',
    'community:ban_users',
    'community:delete_posts',
    'community:pin_posts',
    'community:analytics',

    // Support management
    'support:view_tickets',
    'support:respond_tickets',
    'support:close_tickets',

    // Limited user management
    'users:view',
    'users:suspend',
    'users:activate',

    // Communication
    'communication:send_announcements',
    'communication:send_notifications',

    // Basic analytics
    'analytics:view'
  ],

  'User Support': [
    // Support management
    'support:view_tickets',
    'support:respond_tickets',
    'support:escalate_tickets',
    'support:close_tickets',

    // Limited user management
    'users:view',
    'users:edit',

    // Basic communication
    'communication:send_notifications',

    // Limited analytics
    'analytics:view'
  ],

  user: [
    // Basic permissions for regular users
    'courses:view'
  ]
};

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// Session Management
export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  ip_address: string;
  user_agent: string;
  is_active: boolean;
  created_at: string;
  last_activity: string;
  expires_at: string;
}

// Permission Check Helper
export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('system:full_access');
};

export const hasAnyPermission = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.some(permission => hasPermission(userPermissions, permission));
};

export const hasAllPermissions = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  return requiredPermissions.every(permission => hasPermission(userPermissions, permission));
};

// Role Hierarchy - Using EXACT role strings from database
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'Super Admin': 5,
  'Instructor': 4,
  'Content Manager': 4,
  'Community Manager': 3,
  'User Support': 2,
  user: 1
};

export const canManageRole = (currentUserRole: UserRole, targetRole: UserRole): boolean => {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole];
};

/**
 * Instructor Profile
 * Represents a course instructor with their personal and professional information
 */
export interface Instructor {
  /** Unique identifier for the instructor */
  id: string;
  /** Full name of the instructor */
  name: string;
  /** Professional title or role */
  title: string;
  /** URL to instructor's profile image */
  image: string;
  /** Professional biography */
  bio: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone?: string;
  /** Areas of expertise */
  expertise: string[];
  /** Years of experience */
  experience: number;
  /** Social media links */
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  /** Date when instructor was added */
  createdAt: Date;
}

/**
 * Course Lesson
 * Individual video lesson within a course
 */
export interface Lesson {
  /** Unique identifier for the lesson */
  id: string;
  /** Lesson title */
  title: string;
  /** Duration in format "MM:SS" */
  duration: string;
  /** URL to lesson thumbnail image */
  thumbnail: string;
  /** URL to video content */
  videoUrl: string;
  /** Detailed lesson description */
  description: string;
  /** XP points earned for completing the lesson */
  xpPoints: number;
}

/**
 * Course
 * Complete course information including instructor and lessons
 */
export interface Course {
  /** Unique identifier for the course */
  id: string;
  /** Course title */
  title: string;
  /** Course instructor details */
  instructor: Instructor;
  /** Instructor ID reference */
  instructorId?: string;
  /** Category identifier */
  category: string;
  /** URL to course thumbnail image */
  thumbnail: string;
  /** URL to course banner image */
  banner: string;
  /** URL to course video (for hero banner) */
  videoUrl?: string;
  /** Course description */
  description: string;
  /** Array of course lessons */
  lessons: Lesson[];
  /** Whether the course is featured */
  featured?: boolean;
  /** Total XP points available for the course */
  totalXP: number;
  /** Whether the course is coming soon */
  comingSoon?: boolean;
  /** Expected release date for coming soon courses */
  releaseDate?: string;
}

/**
 * Course Category
 * Course classification and grouping
 */
export interface Category {
  /** Unique identifier for the category */
  id: string;
  /** Category name */
  name: string;
}

/**
 * Achievement
 * Represents a user achievement or badge
 */
export interface Achievement {
  /** Unique identifier for the achievement */
  id: string;
  /** Achievement title */
  title: string;
  /** Achievement description */
  description: string;
  /** Icon name for the achievement */
  icon: string;
  /** XP points awarded for earning the achievement */
  xpPoints: number;
  /** Date when the achievement was earned */
  earnedDate?: Date;
  /** Progress towards earning the achievement (0-100) */
  progress: number;
  /** Type of achievement */
  type: 'course' | 'streak' | 'social' | 'milestone';
}

/**
 * Learning Streak
 * Tracks daily learning consistency
 */
export interface LearningStreak {
  /** Current streak count (days) */
  current: number;
  /** Longest streak achieved */
  longest: number;
  /** Last learning activity date */
  lastActivityDate: Date;
  /** Streak history (last 30 days) */
  history: {
    date: Date;
    completed: boolean;
  }[];
}

/**
 * User Level
 * Represents user progression level
 */
export interface UserLevel {
  /** Current level number */
  current: number;
  /** XP points in current level */
  currentXP: number;
  /** XP points needed for next level */
  nextLevelXP: number;
  /** Total XP points earned */
  totalXP: number;
}

/**
 * Certificate
 * Represents a course completion certificate
 */
export interface Certificate {
  /** Unique identifier for the certificate */
  id: string;
  /** Course the certificate is for */
  courseId: string;
  /** Course title */
  courseTitle: string;
  /** Date certificate was earned */
  earnedDate: Date;
  /** Student name on certificate */
  studentName: string;
  /** Instructor who signed the certificate */
  instructor: string;
  /** Certificate verification code */
  verificationCode: string;
}

/**
 * User Progress
 * Tracks a user's progress through a course
 */
export interface UserProgress {
  /** Course identifier */
  courseId: string;
  /** Current lesson identifier */
  lessonId: string;
  /** Whether the course is completed */
  completed: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** ISO date string of last watched timestamp */
  lastWatched: string;
  /** Certificate earned upon completion */
  certificate?: Certificate;
  /** XP points earned in this course */
  xpEarned: number;
  /** Completed lesson IDs */
  completedLessons: string[];
}

/**
 * Course Progress
 * Extends Course with progress tracking information
 */
export interface CourseProgress extends Course {
  /** Progress percentage (0-100) */
  progress: number;
  /** Current lesson being watched */
  currentLesson: Lesson;
  /** ISO date string of last watched timestamp */
  lastWatched: string;
  /** Certificate earned upon completion */
  certificate?: Certificate;
  /** XP points earned in this course */
  xpEarned: number;
  /** Completed lesson IDs */
  completedLessons: string[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

/**
 * Video Progress Tracking
 * Enhanced tracking for video playback with granular intervals
 */
export interface VideoProgress {
  /** Unique identifier for this progress session */
  id: string;
  /** User identifier */
  userId: string;
  /** Course identifier */
  courseId: string;
  /** Lesson identifier */
  lessonId: string;
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether the video is currently playing */
  isPlaying: boolean;
  /** Whether the video is muted */
  isMuted: boolean;
  /** Current playback rate */
  playbackRate: number;
  /** Timestamp of last update */
  lastUpdated: string;
  /** Device identifier for cross-device sync */
  deviceId: string;
  /** Session identifier for this viewing session */
  sessionId: string;
  /** Whether this is the primary device */
  isPrimaryDevice: boolean;
}

/**
 * Granular Video Tracking Data
 * 30-second interval tracking for detailed analytics
 */
export interface GranularTrackingData {
  /** Interval start time in seconds */
  startTime: number;
  /** Interval end time in seconds */
  endTime: number;
  /** Time spent in this interval */
  timeSpent: number;
  /** Whether user was actively watching */
  isActive: boolean;
  /** User interactions during this interval */
  interactions: VideoInteraction[];
  /** Timestamp of interval */
  timestamp: string;
}

/**
 * Video Interaction
 * Tracks user interactions with the video player
 */
export interface VideoInteraction {
  /** Type of interaction */
  type: 'play' | 'pause' | 'seek' | 'volume_change' | 'fullscreen' | 'speed_change' | 'video_completed';
  /** Time when interaction occurred */
  timestamp: string;
  /** Additional data for the interaction */
  data?: {
    seekTo?: number;
    volume?: number;
    playbackRate?: number;
    isFullscreen?: boolean;
    lessonId?: string;
    courseId?: string;
    completionTime?: number;
    totalDuration?: number;
    completionPercentage?: number;
  };
}

/**
 * Smart Resume Data
 * Stores resume points with buffer information
 */
export interface SmartResumeData {
  /** Resume time in seconds */
  resumeTime: number;
  /** Buffer time in seconds (default 10 seconds) */
  bufferTime: number;
  /** Effective resume time (resumeTime - bufferTime) */
  effectiveResumeTime: number;
  /** Timestamp when resume data was created */
  timestamp: string;
  /** Device identifier */
  deviceId: string;
  /** Whether this is the most recent resume point */
  isLatest: boolean;
}

/**
 * Cross-Device Sync Message
 * WebSocket message for synchronizing video progress across devices
 */
export interface CrossDeviceSyncMessage {
  /** Message type */
  type: 'progress_update' | 'play_state' | 'resume_point' | 'device_connected' | 'device_disconnected';
  /** User identifier */
  userId: string;
  /** Device identifier */
  deviceId: string;
  /** Session identifier */
  sessionId: string;
  /** Message payload */
  payload: {
    courseId?: string;
    lessonId?: string;
    currentTime?: number;
    isPlaying?: boolean;
    resumeTime?: number;
    timestamp: string;
  };
}

/**
 * Real-time Progress Visualization Data
 * Data structure for real-time progress display
 */
export interface RealTimeProgressData {
  /** Current progress percentage */
  progress: number;
  /** Time watched in current session */
  sessionTimeWatched: number;
  /** Total time watched across all sessions */
  totalTimeWatched: number;
  /** Estimated time remaining */
  timeRemaining: number;
  /** Current playback speed */
  playbackSpeed: number;
  /** Whether user is actively watching */
  isActive: boolean;
  /** Last activity timestamp */
  lastActivity: string;
  /** Device information */
  deviceInfo: {
    deviceId: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    isPrimary: boolean;
  };
}

/**
 * Video Analytics Summary
 * Aggregated analytics data for video viewing
 */
export interface VideoAnalyticsSummary {
  /** Total views of this video */
  totalViews: number;
  /** Average completion rate */
  averageCompletionRate: number;
  /** Average watch time in seconds */
  averageWatchTime: number;
  /** Most common drop-off points */
  dropOffPoints: number[];
  /** Engagement heatmap data */
  engagementHeatmap: {
    time: number;
    engagement: number;
  }[];
  /** Device usage statistics */
  deviceUsage: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  /** Cross-device usage statistics */
  crossDeviceUsage: {
    singleDevice: number;
    multipleDevices: number;
    averageDevicesPerUser: number;
  };
}

/**
 * Video Analytics
 * Individual lesson analytics data
 */
export interface VideoAnalytics {
  /** Total number of viewing sessions */
  totalSessions: number;
  /** Total watch time in seconds */
  totalWatchTime: number;
  /** Average session duration in seconds */
  averageSessionDuration: number;
  /** Completion rate percentage (0-100) */
  completionRate: number;
  /** Engagement score percentage (0-100) */
  engagementScore: number;
}
