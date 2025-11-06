# Database Documentation

## Overview

This document provides comprehensive documentation for the database schema, relationships, and data management in the Forward Africa Learning Platform.

## Database Architecture

### Current Technology Stack
- **Primary Database**: Firestore (NoSQL) — migrated from Supabase
- **Development Storage**: LocalStorage (browser-based)
- **Real-time Features**: Firestore real-time listeners
- **File Storage**: Firebase Storage

### Planned Migration
- **Target Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage
- **Real-time**: Firestore real-time listeners
- **Functions**: Firebase Cloud Functions

### Current Database Structure (Legacy - Supabase)

```
Database: forward_africa_platform
├── auth.users (Legacy - Supabase managed)
├── public.user_profiles
├── public.courses
├── public.facilitators
├── public.categories
├── public.user_progress
├── public.certificates
├── public.achievements
├── public.notifications
├── public.audit_logs
└── public.admin_users
```

### Planned Firestore Structure

```
Firestore Collections:
├── users/{userId}
├── courses/{courseId}
├── instructors/{instructorId}
├── categories/{categoryId}
├── progress/{userId}/courses/{courseId}
├── certificates/{certificateId}
├── achievements/{userId}/achievements/{achievementId}
├── notifications/{userId}/notifications/{notificationId}
├── audit_logs/{logId}
└── admin_users/{adminId}
```

## Core Tables/Collections

### User Profiles

**Current (Legacy - Supabase)**:
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  education_level TEXT,
  job_title TEXT,
  topics_of_interest TEXT[],
  onboarding_completed BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'content_manager', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Planned (Firestore)**:
```typescript
interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  educationLevel?: string;
  jobTitle?: string;
  topicsOfInterest?: string[];
  onboardingCompleted: boolean;
  role: 'user' | 'content_manager' | 'admin' | 'super_admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Courses

**Current (Legacy - Supabase)**:
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  banner TEXT NOT NULL,
  instructor JSONB NOT NULL,
  facilitator_id TEXT REFERENCES facilitators(id),
  lessons JSONB[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  coming_soon BOOLEAN DEFAULT FALSE,
  release_date DATE,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Planned (Firestore)**:
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  banner: string;
  instructor: Instructor;
  instructorId?: string;
  lessons: Lesson[];
  featured: boolean;
  comingSoon: boolean;
  releaseDate?: Timestamp;
  totalXP: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // Admin user ID
}
```

### Instructors/Facilitators

**Current (Legacy - Supabase)**:
```sql
CREATE TABLE facilitators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  bio TEXT NOT NULL,
  image TEXT NOT NULL,
  expertise TEXT[] DEFAULT '{}',
  experience INTEGER DEFAULT 0,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Planned (Firestore)**:
```typescript
interface Instructor {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  bio: string;
  image: string;
  expertise: string[];
  experience: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // Admin user ID
}
```

### User Progress

**Current (LocalStorage)**:
```typescript
interface UserProgress {
  courseId: string;
  lessonId: string;
  completed: boolean;
  progress: number;
  lastWatched: string;
  certificate?: Certificate;
  xpEarned: number;
  completedLessons: string[];
}
```

**Planned (Firestore)**:
```typescript
// Collection: progress/{userId}/courses/{courseId}
interface UserProgress {
  courseId: string;
  userId: string;
  currentLessonId?: string;
  completed: boolean;
  progress: number; // 0-100
  lastWatched: Timestamp;
  xpEarned: number;
  completedLessons: string[];
  startedAt: Timestamp;
  completedAt?: Timestamp;
}
```

### Certificates

**Current (LocalStorage)**:
```typescript
interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  earnedDate: Date;
  studentName: string;
  instructor: string;
  verificationCode: string;
}
```

**Planned (Firestore)**:
```typescript
interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  instructor: string;
  verificationCode: string;
  earnedDate: Timestamp;
  createdAt: Timestamp;
  pdfUrl?: string; // Firebase Storage URL
}
```

### Audit Logs

**Current (LocalStorage)**:
```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
}
```

**Planned (Firestore)**:
```typescript
interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: Timestamp;
  resourceType?: string; // 'course', 'user', 'instructor', etc.
  resourceId?: string;
}
```

### Admin Users

**Current (LocalStorage)**:
```typescript
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'content_manager' | 'admin' | 'super_admin';
  password: string; // Hashed in production
  createdAt: Date;
  createdBy: string;
}
```

**Planned (Firestore)**:
```typescript
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'content_manager' | 'admin' | 'super_admin';
  createdAt: Timestamp;
  createdBy: string;
  lastLogin?: Timestamp;
  isActive: boolean;
  permissions?: Permission; // Custom permissions override
}
```

## Security Implementation

### Current (Legacy - Supabase RLS)

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

### Planned (Firestore Security Rules)

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && isAdmin();
    }

    // Courses are readable by authenticated users
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && canManageCourses();
    }

    // User progress is private to the user
    match /progress/{userId}/courses/{courseId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && isAdmin();
    }

    // Audit logs are admin-only
    match /audit_logs/{logId} {
      allow read: if request.auth != null && isAdmin();
      allow write: if request.auth != null && isAdmin();
    }

    // Helper functions
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }

    function canManageCourses() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['content_manager', 'admin', 'super_admin'];
    }
  }
}
```

## Data Migration Plan

### Phase 1: Firebase Setup
1. Create Firebase project
2. Configure authentication
3. Set up Firestore database
4. Configure Firebase Storage
5. Set up Cloud Functions

### Phase 2: Schema Migration
1. Create Firestore collections
2. Implement security rules
3. Set up indexes for queries
4. Create data validation functions

### Phase 3: Data Transfer
1. Export data from Supabase
2. Transform data to Firestore format
3. Import data to Firestore
4. Validate data integrity

### Phase 4: Application Updates
1. Update authentication logic
2. Replace Supabase client with Firebase
3. Update all database operations
4. Implement real-time listeners

### Phase 5: Testing and Validation
1. Test all functionality
2. Validate security rules
3. Performance testing
4. User acceptance testing

## Firestore Advantages

### Benefits of Migration

1. **Better Scalability**: Automatic scaling with usage
2. **Real-time Updates**: Built-in real-time listeners
3. **Offline Support**: Automatic offline synchronization
4. **Google Integration**: Better integration with Google services
5. **Cost Efficiency**: Pay-per-use pricing model
6. **Global Distribution**: Multi-region deployment

### Query Optimization

```typescript
// Efficient queries with Firestore
const getCoursesByCategory = async (category: string) => {
  const q = query(
    collection(db, 'courses'),
    where('category', '==', category),
    where('comingSoon', '==', false),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Real-time progress tracking
const subscribeToUserProgress = (userId: string, callback: (progress: UserProgress[]) => void) => {
  const q = query(collection(db, `progress/${userId}/courses`));

  return onSnapshot(q, (snapshot) => {
    const progress = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(progress);
  });
};
```

## Performance Considerations

### Current Performance
- LocalStorage for development (fast, limited storage)
- Supabase for production (good performance, PostgreSQL benefits)

### Firestore Performance
- Automatic indexing for queries
- Real-time updates without polling
- Offline caching for better UX
- Global CDN for fast access

### Optimization Strategies
1. **Denormalization**: Store related data together
2. **Composite Indexes**: Optimize complex queries
3. **Pagination**: Use cursor-based pagination
4. **Caching**: Implement client-side caching
5. **Batch Operations**: Use batch writes for multiple updates

## Backup and Recovery

### Current Backup (Supabase)
- Automated daily backups
- Point-in-time recovery
- Manual export capabilities

### Planned Backup (Firebase)
- Firestore export/import
- Cloud Functions for automated backups
- Cross-region replication
- Version control for schema changes

## Monitoring and Analytics

### Current Monitoring
- Basic logging in development
- Supabase dashboard metrics

### Planned Monitoring (Firebase)
- Firebase Analytics integration
- Performance monitoring
- Error tracking with Crashlytics
- Custom metrics and alerts

---

This database documentation provides a comprehensive overview of the current state and planned migration to Firebase Firestore, ensuring a smooth transition while maintaining data integrity and improving performance.
