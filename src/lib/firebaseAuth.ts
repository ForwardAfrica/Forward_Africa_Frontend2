// Firebase Auth Service - Now using Backend Endpoints
// All Firestore operations have been migrated to backend API routes
// This service now provides minimal client-side auth functionality

import { auth, onAuthStateChanged as firebaseOnAuthStateChanged } from './firebase';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: 'user' | 'Super Admin' | 'Instructor' | 'Content Manager' | 'Community Manager' | 'User Support';
  permissions: string[];
  onboarding_completed: boolean;
  industry?: string;
  experience_level?: string;
  business_stage?: string;
  country?: string;
  state_province?: string;
  city?: string;
  created_at: any;
  updated_at: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  education_level?: string;
  job_title?: string;
  topics_of_interest?: string[];
  industry?: string;
  experience_level?: string;
  business_stage?: string;
  country?: string;
  state_province?: string;
  city?: string;
}

export interface AuthResponse {
  user: FirebaseUser;
  message: string;
}

// Enhanced error handling
export class FirebaseAuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FirebaseAuthError';
  }
}

// Get user data from backend
const getUserDataFromBackend = async (userId: string): Promise<FirebaseUser | null> => {
  try {
    const response = await fetch(`/api/users/data/${userId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.warn('Failed to fetch user data from backend');
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.warn('Error fetching user data from backend:', error);
    return null;
  }
};

// Create user data in backend
const createUserDataInBackend = async (userId: string, userData: Partial<FirebaseUser>): Promise<void> => {
  try {
    await fetch(`/api/users/data/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
  } catch (error) {
    console.warn('Error creating user data in backend:', error);
    // Don't throw - continue with app
  }
};

// Update user data in backend
const updateUserDataInBackend = async (userId: string, userData: Partial<FirebaseUser>): Promise<void> => {
  try {
    await fetch(`/api/users/data/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
  } catch (error) {
    console.warn('Error updating user data in backend:', error);
    // Don't throw - continue with app
  }
};

// Convert Firebase User to our custom user format with fallback
const convertFirebaseUserWithFallback = (uid: string, email: string | null, displayName: string | null, photoURL: string | null, emailVerified: boolean, backendData?: any): FirebaseUser => {
  return {
    uid,
    email,
    displayName,
    photoURL,
    emailVerified,
    role: backendData?.role || 'user',
    permissions: backendData?.permissions || [],
    onboarding_completed: backendData?.onboarding_completed || false,
    industry: backendData?.industry,
    experience_level: backendData?.experience_level,
    business_stage: backendData?.business_stage,
    country: backendData?.country,
    state_province: backendData?.state_province,
    city: backendData?.city,
    created_at: backendData?.created_at || null,
    updated_at: backendData?.updated_at || null
  };
};

export const firebaseAuthService = {
  // Listen to Firebase Auth state changes
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get backend user data
        const backendData = await getUserDataFromBackend(firebaseUser.uid);
        const user = convertFirebaseUserWithFallback(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName,
          firebaseUser.photoURL,
          firebaseUser.emailVerified,
          backendData
        );
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  // Get current user from Firebase Auth
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!auth.currentUser;
  },

  // Check if user has admin privileges
  isAdmin: (user: FirebaseUser | null): boolean => {
    return user?.role === 'Super Admin' || user?.role === 'Content Manager' || user?.role === 'Instructor' || user?.role === 'Community Manager';
  },

  // Check if user is super admin
  isSuperAdmin: (user: FirebaseUser | null): boolean => {
    return user?.role === 'Super Admin';
  },

  // Update user profile via backend
  updateProfile: async (userId: string, profileData: Partial<FirebaseUser>): Promise<FirebaseUser> => {
    try {
      console.log('🔄 Auth: Updating user profile via backend...');

      await updateUserDataInBackend(userId, {
        ...profileData,
        updated_at: new Date()
      });

      // Return updated user object
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new FirebaseAuthError('NO_USER', 'No authenticated user');
      }

      const updated = convertFirebaseUserWithFallback(
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.displayName,
        firebaseUser.photoURL,
        firebaseUser.emailVerified,
        profileData
      );

      console.log('✅ Auth: Profile updated successfully via backend');
      return updated;
    } catch (error: any) {
      console.error('❌ Auth: Profile update failed:', error);
      throw new FirebaseAuthError('PROFILE_UPDATE_FAILED', error.message || 'Profile update failed');
    }
  },

  // Get user data from backend (if available)
  getUserData: async (userId: string): Promise<FirebaseUser | null> => {
    try {
      return await getUserDataFromBackend(userId);
    } catch (error) {
      console.warn('Error getting user data:', error);
      return null;
    }
  },

  // Create user data in backend (called during registration)
  createUserData: async (userId: string, userData: Partial<FirebaseUser>): Promise<void> => {
    try {
      await createUserDataInBackend(userId, {
        ...userData,
        created_at: new Date(),
        updated_at: new Date()
      });
    } catch (error) {
      console.warn('Error creating user data:', error);
      // Don't throw - continue with app
    }
  }
};
