# Backend API Documentation

## Overview

This document provides comprehensive documentation for the backend API endpoints, authentication, and data management in the Forward Africa Learning Platform.

## API Architecture

### Current Technology Stack
- **Backend**: Firebase (Firestore + Cloud Functions) — migrated from Supabase
- **Authentication**: Firebase Auth
- **Real-time**: Firestore real-time listeners
- **File Storage**: Firebase Storage
- **Functions**: Firebase Cloud Functions (Node.js runtime)

### Planned Migration
- **Backend**: Firebase (Firestore + Cloud Functions)
- **Authentication**: Firebase Auth
- **Real-time**: Firestore real-time listeners
- **File Storage**: Firebase Storage
- **Functions**: Firebase Cloud Functions (Node.js runtime)

### Base URL
```
Current Production: https://your-project.supabase.co
Current Development: http://localhost:54321
Planned Production: https://your-project.firebaseapp.com
Planned Development: http://localhost:9099
```

### Authentication
All API requests require authentication via JWT tokens in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Authentication API

### Current Authentication (Supabase)

#### Sign Up
**Endpoint**: `POST /auth/v1/signup`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "data": {
    "full_name": "John Doe"
  }
}
```

#### Sign In with Google
**Endpoint**: `POST /auth/v1/authorize`

**Request Body**:
```json
{
  "provider": "google",
  "redirect_to": "https://yourapp.com/auth/callback"
}
```

### Planned Authentication (Firebase)

#### Sign Up
```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const signUp = async (email: string, password: string, userData: any) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Create user profile in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email,
    fullName: userData.full_name,
    createdAt: serverTimestamp(),
    onboardingCompleted: false,
    role: 'user'
  });

  return userCredential;
};
```

#### Sign In with Google
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};
```

## User Management API

### Current Implementation (Supabase)

#### Get User Profile
**Endpoint**: `GET /rest/v1/user_profiles?id=eq.{user_id}`

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "education_level": "Bachelor's Degree",
  "job_title": "Software Engineer",
  "topics_of_interest": ["Technology", "Business"],
  "onboarding_completed": true,
  "role": "user",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Planned Implementation (Firebase)

#### Get User Profile
```typescript
import { doc, getDoc } from 'firebase/firestore';

const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('User not found');
  }
};
```

#### Update User Profile
```typescript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};
```

## Course Management API

### Current Implementation (Supabase)

#### Get All Courses
**Endpoint**: `GET /rest/v1/courses`

**Query Parameters**:
- `category=eq.{category_id}`: Filter by category
- `featured=eq.true`: Get only featured courses
- `coming_soon=eq.false`: Exclude coming soon courses
- `order=created_at.desc`: Sort by creation date

### Planned Implementation (Firebase)

#### Get All Courses
```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const getAllCourses = async (filters?: {
  category?: string;
  featured?: boolean;
  comingSoon?: boolean;
  limit?: number;
}) => {
  let q = query(collection(db, 'courses'));

  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }

  if (filters?.featured !== undefined) {
    q = query(q, where('featured', '==', filters.featured));
  }

  if (filters?.comingSoon !== undefined) {
    q = query(q, where('comingSoon', '==', filters.comingSoon));
  }

  q = query(q, orderBy('createdAt', 'desc'));

  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

#### Create Course (Cloud Function)
```typescript
// Cloud Function: createCourse
import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

export const createCourse = onCall(async (request) => {
  // Verify user permissions
  const userDoc = await getFirestore()
    .collection('users')
    .doc(request.auth?.uid)
    .get();

  const userRole = userDoc.data()?.role;

  if (!['content_manager', 'admin', 'super_admin'].includes(userRole)) {
    throw new Error('Insufficient permissions');
  }

  // Create course
  const courseData = {
    ...request.data,
    createdAt: new Date(),
    createdBy: request.auth?.uid
  };

  const docRef = await getFirestore()
    .collection('courses')
    .add(courseData);

  // Log audit event
  await getFirestore()
    .collection('audit_logs')
    .add({
      userId: request.auth?.uid,
      action: 'course_created',
      details: `Created course: ${courseData.title}`,
      timestamp: new Date(),
      resourceType: 'course',
      resourceId: docRef.id
    });

  return { id: docRef.id };
});
```

## Progress Tracking API

### Current Implementation (LocalStorage)

```typescript
// Local storage implementation
const updateProgress = (courseId: string, lessonId: string, progress: number) => {
  const storedProgress = localStorage.getItem('userProgress');
  const progressData = storedProgress ? JSON.parse(storedProgress) : {};

  progressData[courseId] = {
    lessonId,
    progress,
    lastWatched: new Date().toISOString()
  };

  localStorage.setItem('userProgress', JSON.stringify(progressData));
};
```

### Planned Implementation (Firebase)

#### Update Progress
```typescript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const updateUserProgress = async (
  userId: string,
  courseId: string,
  progressData: Partial<UserProgress>
) => {
  const docRef = doc(db, `progress/${userId}/courses/${courseId}`);

  await setDoc(docRef, {
    ...progressData,
    userId,
    courseId,
    lastWatched: serverTimestamp()
  }, { merge: true });
};
```

#### Real-time Progress Subscription
```typescript
import { doc, onSnapshot } from 'firebase/firestore';

const subscribeToUserProgress = (
  userId: string,
  courseId: string,
  callback: (progress: UserProgress | null) => void
) => {
  const docRef = doc(db, `progress/${userId}/courses/${courseId}`);

  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as UserProgress);
    } else {
      callback(null);
    }
  });
};
```

## Certificate Management API

### Planned Implementation (Firebase)

#### Generate Certificate (Cloud Function)
```typescript
// Cloud Function: generateCertificate
import { onCall } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export const generateCertificate = onCall(async (request) => {
  const { courseId, courseTitle, studentName, instructor } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Verify course completion
  const progressDoc = await getFirestore()
    .collection('progress')
    .doc(userId)
    .collection('courses')
    .doc(courseId)
    .get();

  if (!progressDoc.exists() || !progressDoc.data()?.completed) {
    throw new Error('Course not completed');
  }

  // Generate verification code
  const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();

  // Create certificate document
  const certificateData = {
    userId,
    courseId,
    courseTitle,
    studentName,
    instructor,
    verificationCode,
    earnedDate: new Date(),
    createdAt: new Date()
  };

  const docRef = await getFirestore()
    .collection('certificates')
    .add(certificateData);

  // Generate PDF and upload to Storage
  const pdfBuffer = await generateCertificatePDF(certificateData);
  const bucket = getStorage().bucket();
  const file = bucket.file(`certificates/${docRef.id}.pdf`);

  await file.save(pdfBuffer, {
    metadata: {
      contentType: 'application/pdf'
    }
  });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2491' // Far future date
  });

  // Update certificate with PDF URL
  await docRef.update({ pdfUrl: url });

  return {
    certificateId: docRef.id,
    verificationCode,
    pdfUrl: url
  };
});
```

## Admin Management API

### Planned Implementation (Firebase)

#### Create Admin User (Cloud Function)
```typescript
// Cloud Function: createAdminUser
import { onCall } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const createAdminUser = onCall(async (request) => {
  const currentUserDoc = await getFirestore()
    .collection('users')
    .doc(request.auth?.uid)
    .get();

  const currentUserRole = currentUserDoc.data()?.role;

  // Only admins and super admins can create admin users
  if (!['admin', 'super_admin'].includes(currentUserRole)) {
    throw new Error('Insufficient permissions');
  }

  const { email, password, name, role } = request.data;

  // Only super admins can create super admin accounts
  if (role === 'super_admin' && currentUserRole !== 'super_admin') {
    throw new Error('Only super admins can create super admin accounts');
  }

  // Create user in Firebase Auth
  const userRecord = await getAuth().createUser({
    email,
    password,
    displayName: name
  });

  // Create user profile in Firestore
  await getFirestore()
    .collection('users')
    .doc(userRecord.uid)
    .set({
      email,
      fullName: name,
      role,
      createdAt: new Date(),
      createdBy: request.auth?.uid,
      isActive: true,
      onboardingCompleted: true
    });

  // Log audit event
  await getFirestore()
    .collection('audit_logs')
    .add({
      userId: request.auth?.uid,
      action: 'admin_user_created',
      details: `Created ${role} account: ${email}`,
      timestamp: new Date(),
      resourceType: 'user',
      resourceId: userRecord.uid
    });

  return { userId: userRecord.uid };
});
```

## Real-time API

### Current Implementation (Supabase)

```typescript
// Supabase real-time subscription
const subscription = supabase
  .channel('user_progress')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'user_progress',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Progress updated:', payload.new);
  })
  .subscribe();
```

### Planned Implementation (Firebase)

```typescript
// Firestore real-time listeners
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const subscribeToUserProgress = (userId: string, callback: (progress: UserProgress[]) => void) => {
  const q = query(
    collection(db, `progress/${userId}/courses`)
  );

  return onSnapshot(q, (snapshot) => {
    const progress = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProgress[];

    callback(progress);
  });
};

// Subscribe to notifications
const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    collection(db, `notifications/${userId}/messages`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];

    callback(notifications);
  });
};
```

## File Storage API

### Current Implementation (Supabase Storage)

```typescript
// Upload file to Supabase Storage
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file);

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);
```

### Planned Implementation (Firebase Storage)

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload file to Firebase Storage
const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// Upload avatar
const uploadAvatar = async (userId: string, file: File) => {
  const path = `avatars/${userId}/${file.name}`;
  return await uploadFile(file, path);
};

// Upload course media
const uploadCourseMedia = async (courseId: string, file: File) => {
  const path = `course-media/${courseId}/${file.name}`;
  return await uploadFile(file, path);
};
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Insufficient permissions to perform this action",
    "details": "User role 'content_manager' cannot delete courses"
  }
}
```

### Firebase Error Handling
```typescript
import { FirebaseError } from 'firebase/app';

const handleFirebaseError = (error: FirebaseError) => {
  switch (error.code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action';
    case 'not-found':
      return 'The requested resource was not found';
    case 'already-exists':
      return 'A resource with this identifier already exists';
    case 'unauthenticated':
      return 'Authentication required';
    default:
      return 'An unexpected error occurred';
  }
};
```

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return getUserRole() in ['admin', 'super_admin'];
    }

    function canManageCourses() {
      return getUserRole() in ['content_manager', 'admin', 'super_admin'];
    }

    // User profiles
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAuthenticated() && isAdmin();
      allow write: if isAuthenticated() && isAdmin();
    }

    // Courses
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && canManageCourses();
      allow delete: if isAuthenticated() && isAdmin();
    }

    // User progress
    match /progress/{userId}/courses/{courseId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isAuthenticated() && isAdmin();
    }

    // Certificates
    match /certificates/{certificateId} {
      allow read: if isAuthenticated() &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() &&
        request.auth.uid == resource.data.userId;
    }

    // Audit logs (admin only)
    match /audit_logs/{logId} {
      allow read, write: if isAuthenticated() && isAdmin();
    }
  }
}
```

### Firebase Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Course media (admin managed)
    match /course-media/{courseId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        getUserRole() in ['content_manager', 'admin', 'super_admin'];
    }

    // Certificates (private)
    match /certificates/{certificateId} {
      allow read: if request.auth != null &&
        (resource.metadata.userId == request.auth.uid || isAdmin());
    }

    function getUserRole() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return getUserRole() in ['admin', 'super_admin'];
    }
  }
}
```

## Migration Considerations

### Data Migration Strategy
1. **Parallel Operation**: Run both systems during transition
2. **Gradual Migration**: Migrate features incrementally
3. **Data Validation**: Ensure data integrity during transfer
4. **Rollback Plan**: Ability to revert if issues arise

### API Compatibility
- Maintain similar API structure where possible
- Use adapter pattern for smooth transition
- Implement feature flags for gradual rollout
- Comprehensive testing of all endpoints

---

This API documentation provides a comprehensive overview of the current Supabase implementation and the planned Firebase migration, ensuring a smooth transition while maintaining all functionality and improving performance.
