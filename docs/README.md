# Forward Africa Learning Platform - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Frontend Documentation](#frontend-documentation)
4. [Backend Documentation](#backend-documentation)
5. [API Reference](#api-reference)
6. [Component Library](#component-library)
7. [Data Models](#data-models)
8. [Authentication & Authorization](#authentication--authorization)
9. [Deployment Guide](#deployment-guide)
10. [Development Guide](#development-guide)
11. [Firebase Migration Plan](#firebase-migration-plan)

## Project Overview

Forward Africa is a comprehensive learning management system designed specifically for African entrepreneurs and professionals. The platform provides expert-led courses, AI-powered assistance, community features, and administrative tools with robust role-based access control.

### Key Features

- **Course Management**: Upload, manage, and deliver video-based courses with YouTube and direct video support
- **User Management**: Comprehensive role-based access control with multiple user types
- **AI Assistant**: Afrisage AI for business guidance and support
- **Community Features**: Discussion groups and networking capabilities
- **Admin Dashboard**: Full administrative interface with permission enforcement
- **Certificate Generation**: Automated PDF certificate creation and download
- **Progress Tracking**: Detailed learning analytics and progress monitoring
- **Role-Based Permissions**: Granular permission system for different user roles
- **Audit Logging**: Complete activity tracking for security and compliance

### Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Real-time) — migrated from Supabase
- **Build Tool**: Vite
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Charts**: Recharts
- **Video Player**: Custom implementation with YouTube embedding support

## Architecture

### Current Architecture

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, Footer, Layout)
│   └── ui/             # UI components (Button, VideoPlayer, etc.)
├── contexts/           # React Context providers
├── data/              # Mock data and data utilities
├── hooks/             # Custom React hooks
├── lib/               # External library configurations
├── pages/             # Page components
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── main.tsx           # Application entry point
```

### Data Flow

1. **Authentication**: Firebase Auth
2. **State Management**: React Context for global state
3. **Data Storage**: LocalStorage for development, Firestore for production
4. **Real-time Updates**: Firestore real-time listeners
5. **File Storage**: Firebase Storage

## Frontend Documentation

### User Roles and Permissions

The application implements a comprehensive role-based access control system:

#### User Roles
- **User**: Basic learners with course access
- **Content Manager**: Can create and edit courses, manage instructors
- **Admin**: Full platform management except super admin functions
- **Super Admin**: Complete system control including admin management

#### Permission Matrix

| Feature | User | Content Manager | Admin | Super Admin |
|---------|------|----------------|-------|-------------|
| View Courses | ✅ | ✅ | ✅ | ✅ |
| Enroll in Courses | ✅ | ✅ | ✅ | ✅ |
| Create Courses | ❌ | ✅ | ✅ | ✅ |
| Edit Courses | ❌ | ✅ | ✅ | ✅ |
| Delete Courses | ❌ | ❌ | ✅ | ✅ |
| Manage Instructors | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ❌ | ✅ | ✅ |
| Access Audit Logs | ❌ | ❌ | ✅ | ✅ |
| Manage Settings | ❌ | ❌ | ✅ | ✅ |
| Create Admin Users | ❌ | ❌ | ✅ | ✅ |
| Manage Super Admins | ❌ | ❌ | ❌ | ✅ |

### Pages Documentation

#### Public Pages
- **Landing Page** (`/`): Marketing page with authentication
- **About Page** (`/about`): Company information and mission

#### Authentication Pages
- **Onboarding Page** (`/onboarding`): Multi-step user setup
- **Admin Login** (`/admin/login`): Secure admin authentication

#### Main Application Pages
- **Home Page** (`/home`): Dashboard with course recommendations
- **Courses Page** (`/courses`): Browse all courses with filtering
- **Course Detail** (`/course/:id`): Video player and lesson navigation
- **Search Page** (`/search`): Advanced search with filters
- **Community Page** (`/community`): Professional networking groups
- **Chat Page** (`/community/chat/:groupId`): Real-time group messaging
- **Afrisage Page** (`/afri-sage`): AI business assistant
- **Profile Page** (`/profile`): User account management

#### Administrative Pages
- **Admin Dashboard** (`/admin`): Main administrative interface
- **Admin Profile** (`/admin/profile`): Admin account management
- **Create Admin User** (`/admin/create-user`): Admin user creation
- **Upload Course** (`/admin/upload-course`): Course creation/editing
- **Add Instructor** (`/admin/add-instructor`): Instructor management
- **Manage Users** (`/admin/manage-users`): User management interface
- **Security Settings** (`/admin/security-settings`): Platform security configuration

### Component Documentation

#### Core Components

**VideoPlayer Component**
- Supports YouTube URLs and direct video files
- Custom controls for direct videos
- Error handling and retry functionality
- Fullscreen support
- Progress tracking

**CourseCard Component**
- Course thumbnail display with hover effects
- Coming soon indicators
- Instructor information
- Play button overlay

**PermissionGuard Component**
- Role-based access control
- Error message display
- Fallback content support
- Unauthorized action handling

#### Layout Components

**Header Component**
- Responsive navigation
- User authentication status
- Notifications dropdown
- Profile management
- Mobile menu support

**Footer Component**
- Site information and links
- Newsletter subscription
- Social media links
- Admin login access

### Hooks Documentation

**useAuth Hook**
```typescript
const { user, profile, loading, signOut, refreshProfile, isSupabaseConfigured } = useAuth();
```

**usePermissions Hook**
```typescript
const { userRole, permissions, hasPermission, checkPermission } = usePermissions();
```

**useNotifications Hook**
```typescript
const { notifications, addNotification, markAsRead, unreadCount } = useNotifications();
```

**useCertificates Hook**
```typescript
const { certificates, generateCertificate, getCertificate } = useCertificates();
```

## Backend Documentation

### Backend (Firebase)

#### Database Schema

**User Profiles Table**
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

**Courses Table**
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

#### Row Level Security (RLS)

All tables implement comprehensive RLS policies:
- Users can only access their own data
- Admins have elevated access based on roles
- System operations are properly authorized

### Data Storage Strategy

#### Development Mode
- **Local Storage**: Course data, user progress, settings
- **Session Storage**: Temporary data
- **Memory**: Real-time state management

#### Production Mode (Current)
- **Firestore Database**: All persistent data
- **Firebase Storage**: Media files and assets
- **CDN**: Static assets and optimized images

## Authentication & Authorization

### Current Authentication Flow

1. **Sign Up**: User creates account via Firebase Auth
2. **Email Verification**: Optional email confirmation
3. **Profile Creation**: User completes onboarding
4. **Session Management**: JWT tokens for authentication
5. **Role Assignment**: Admin assigns user roles

### Permission System

The application uses a comprehensive permission system with:
- Granular permissions for each action
- Role-based permission inheritance
- Runtime permission checking
- Error handling for unauthorized access

### Security Features

- **Password Policy**: Configurable requirements
- **Session Management**: Timeout and concurrent session limits
- **IP Whitelisting**: Admin-configurable restrictions
- **Two-Factor Authentication**: Optional 2FA support
- **Audit Logging**: Complete activity tracking

## Data Models

### Core Types

```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  education_level?: string;
  job_title?: string;
  topics_of_interest?: string[];
  onboarding_completed: boolean;
  role: 'user' | 'content_manager' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

interface Course {
  id: string;
  title: string;
  instructor: Instructor;
  instructorId?: string;
  category: string;
  thumbnail: string;
  banner: string;
  description: string;
  lessons: Lesson[];
  featured?: boolean;
  totalXP: number;
  comingSoon?: boolean;
  releaseDate?: string;
}

interface Instructor {
  id: string;
  name: string;
  title: string;
  image: string;
  bio: string;
  email: string;
  phone?: string;
  expertise: string[];
  experience: number;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: Date;
}
```

## Firebase Migration Plan

### Migration Overview

The application will be migrated from Supabase to Firebase for better scalability and integration with Google services.

### Firebase Services Integration

#### 1. Firebase Authentication
- **Current**: Supabase Auth
- **Migration**: Firebase Auth with email/password and Google OAuth
- **Benefits**: Better Google integration, more auth providers

#### 2. Firestore Database
- **Current**: Supabase PostgreSQL
- **Migration**: Firestore NoSQL database
- **Schema Design**:
  ```
  /users/{userId}
  /courses/{courseId}
  /instructors/{instructorId}
  /progress/{userId}/courses/{courseId}
  /certificates/{certificateId}
  /audit_logs/{logId}
  ```

#### 3. Firebase Storage
- **Current**: Supabase Storage
- **Migration**: Firebase Storage for media files
- **Structure**:
  ```
  /avatars/{userId}/
  /course-media/{courseId}/
  /certificates/{certificateId}/
  ```

#### 4. Cloud Functions
- **Current**: Supabase Edge Functions
- **Migration**: Firebase Cloud Functions
- **Functions**:
  - Certificate generation
  - Email notifications
  - Data validation
  - Analytics processing

#### 5. Firebase Security Rules
- **Firestore Rules**: Role-based access control
- **Storage Rules**: File access permissions
- **Auth Rules**: User authentication requirements

### Migration Steps

1. **Phase 1**: Set up Firebase project and configuration
2. **Phase 2**: Migrate authentication system
3. **Phase 3**: Migrate database schema to Firestore
4. **Phase 4**: Implement Cloud Functions
5. **Phase 5**: Migrate file storage
6. **Phase 6**: Update frontend to use Firebase SDKs
7. **Phase 7**: Testing and validation
8. **Phase 8**: Production deployment

### Firebase Configuration

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
```

## Deployment Guide

### Current Deployment

The application is currently configured for deployment on:
- **Frontend**: Netlify (recommended)
- **Backend**: Supabase (managed service)

### Post-Firebase Migration Deployment

- **Frontend**: Netlify or Firebase Hosting
- **Backend**: Firebase (managed services)
- **Functions**: Firebase Cloud Functions
- **Database**: Firestore
- **Storage**: Firebase Storage

### Environment Variables

```env
# Current (Supabase)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Future (Firebase)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Development Guide

### Getting Started

```bash
# Clone repository
git clone <repository-url>
cd forward-africa-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Workflow

1. **Feature Development**: Create feature branches
2. **Code Standards**: TypeScript, ESLint, Prettier
3. **Testing Strategy**: Unit and integration tests
4. **Documentation**: Update docs with changes

### File Organization

The codebase follows a modular architecture with clear separation of concerns:
- Components are organized by functionality
- Hooks provide reusable logic
- Utils contain helper functions
- Types define data structures
- Contexts manage global state

### Performance Optimization

- Code splitting with React.lazy
- Image optimization and lazy loading
- Memoization for expensive operations
- Efficient re-rendering patterns

## Security

### Current Security Measures

- JWT-based authentication
- Row Level Security (RLS) policies
- Role-based access control
- Input validation and sanitization
- Audit logging for all actions
- Password policy enforcement
- Session management

### Firebase Security (Planned)

- Firebase Security Rules
- Cloud Functions for server-side validation
- Identity and Access Management (IAM)
- Security monitoring and alerts

## Monitoring and Analytics

### Current Monitoring

- Error boundaries for React components
- Console logging for development
- Audit logs for admin actions
- Performance monitoring (planned)

### Firebase Analytics (Planned)

- Google Analytics integration
- Custom event tracking
- Performance monitoring
- Crash reporting

## Contributing

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

### Code Review Guidelines
- Check for TypeScript errors
- Verify responsive design
- Test accessibility features
- Review security implications

---

This documentation reflects the current state of the Forward Africa Learning Platform and outlines the planned migration to Firebase. The application features a comprehensive role-based permission system, full administrative capabilities, and is ready for production deployment.
