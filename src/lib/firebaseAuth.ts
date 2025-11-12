import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: 'user' | 'content_manager' | 'community_manager' | 'user_support' | 'super_admin';
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

// Convert Firebase User to our custom user format
const convertFirebaseUser = async (firebaseUser: User): Promise<FirebaseUser> => {
  try {
    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        role: userData.role || 'user',
        permissions: userData.permissions || [],
        onboarding_completed: userData.onboarding_completed || false,
        industry: userData.industry,
        experience_level: userData.experience_level,
        business_stage: userData.business_stage,
        country: userData.country,
        state_province: userData.state_province,
        city: userData.city,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };
    } else {
      // Create default user profile
      const defaultUser: FirebaseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        role: 'user',
        permissions: [],
        onboarding_completed: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      // Save to Firestore
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), defaultUser);
      } catch (writeError: any) {
        // If write fails due to permissions, return the default user anyway
        // The user can still use the app, and the document will be created on next update
        console.warn('⚠️ Could not create user document in Firestore:', writeError);
        if (writeError.code !== 'permission-denied') {
          throw writeError;
        }
      }
      return defaultUser;
    }
  } catch (error: any) {
    console.error('❌ Error converting Firebase user:', error);

    // If it's a permission error, return a minimal user object
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.warn('⚠️ Permission denied when accessing user document. Returning minimal user data.');
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        role: 'user',
        permissions: [],
        onboarding_completed: false,
        created_at: null,
        updated_at: null
      };
    }

    throw new FirebaseAuthError('USER_CONVERSION_FAILED', error.message || 'Failed to convert user data', error);
  }
};

export const firebaseAuthService = {
  // Sign in with email and password
  signIn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('🔐 Firebase Auth: Signing in...');

      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const user = await convertFirebaseUser(firebaseUser);

      console.log('✅ Firebase Auth: Sign in successful');
      return {
        user,
        message: 'Sign in successful'
      };
    } catch (error: any) {
      console.error('❌ Firebase Auth: Sign in failed:', error);

      // Handle specific Firebase error codes
      switch (error.code) {
        case 'auth/user-not-found':
          throw new FirebaseAuthError('USER_NOT_FOUND', 'No user found with this email address');
        case 'auth/wrong-password':
          throw new FirebaseAuthError('WRONG_PASSWORD', 'Incorrect password');
        case 'auth/invalid-email':
          throw new FirebaseAuthError('INVALID_EMAIL', 'Invalid email address');
        case 'auth/user-disabled':
          throw new FirebaseAuthError('USER_DISABLED', 'This account has been disabled');
        case 'auth/too-many-requests':
          throw new FirebaseAuthError('TOO_MANY_REQUESTS', 'Too many failed attempts. Please try again later');
        default:
          throw new FirebaseAuthError('SIGN_IN_FAILED', error.message || 'Sign in failed');
      }
    }
  },

  // Sign up with email and password
  signUp: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('📝 Firebase Auth: Signing up...');

      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Update Firebase user profile
      await firebaseUpdateProfile(firebaseUser, {
        displayName: userData.full_name
      });

      // Create user profile in Firestore
      const userProfile: FirebaseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: userData.full_name,
        photoURL: null,
        emailVerified: false,
        role: 'user',
        permissions: [],
        onboarding_completed: false,
        industry: userData.industry,
        experience_level: userData.experience_level,
        business_stage: userData.business_stage,
        country: userData.country,
        state_province: userData.state_province,
        city: userData.city,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

      // Send email verification
      await sendEmailVerification(firebaseUser);

      const user = await convertFirebaseUser(firebaseUser);

      console.log('✅ Firebase Auth: Sign up successful');
      return {
        user,
        message: 'Account created successfully. Please check your email for verification.'
      };
    } catch (error: any) {
      console.error('❌ Firebase Auth: Sign up failed:', error);

      // Handle specific Firebase error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new FirebaseAuthError('EMAIL_EXISTS', 'An account with this email already exists');
        case 'auth/invalid-email':
          throw new FirebaseAuthError('INVALID_EMAIL', 'Invalid email address');
        case 'auth/weak-password':
          throw new FirebaseAuthError('WEAK_PASSWORD', 'Password should be at least 6 characters');
        case 'auth/operation-not-allowed':
          throw new FirebaseAuthError('OPERATION_NOT_ALLOWED', 'Email/password accounts are not enabled');
        default:
          throw new FirebaseAuthError('SIGN_UP_FAILED', error.message || 'Sign up failed');
      }
    }
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<AuthResponse> => {
    try {
      console.log('🔐 Firebase Auth: Signing in with Google...');

      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);

      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        const userProfile: FirebaseUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          role: 'user',
          permissions: [],
          onboarding_completed: false,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      }

      const user = await convertFirebaseUser(firebaseUser);

      console.log('✅ Firebase Auth: Google sign in successful');
      return {
        user,
        message: 'Google sign in successful'
      };
    } catch (error: any) {
      console.error('❌ Firebase Auth: Google sign in failed:', error);

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new FirebaseAuthError('POPUP_CLOSED', 'Sign in popup was closed');
        case 'auth/cancelled-popup-request':
          throw new FirebaseAuthError('POPUP_CANCELLED', 'Sign in was cancelled');
        default:
          throw new FirebaseAuthError('GOOGLE_SIGN_IN_FAILED', error.message || 'Google sign in failed');
      }
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    try {
      console.log('🚪 Firebase Auth: Signing out...');
      await signOut(auth);
      console.log('✅ Firebase Auth: Sign out successful');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Sign out failed:', error);
      throw new FirebaseAuthError('SIGN_OUT_FAILED', error.message || 'Sign out failed');
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<FirebaseUser>): Promise<FirebaseUser> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new FirebaseAuthError('NO_USER', 'No authenticated user');
      }

      console.log('🔄 Firebase Auth: Updating profile...');

      // Update Firebase Auth profile if display name or photo URL changed
      if (profileData.displayName || profileData.photoURL) {
        await firebaseUpdateProfile(currentUser, {
          displayName: profileData.displayName || undefined,
          photoURL: profileData.photoURL || undefined
        });
      }

      // Update Firestore profile
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...profileData,
        updated_at: serverTimestamp()
      });

      const user = await convertFirebaseUser(currentUser);

      console.log('✅ Firebase Auth: Profile updated successfully');
      return user;
    } catch (error: any) {
      console.error('❌ Firebase Auth: Profile update failed:', error);
      throw new FirebaseAuthError('PROFILE_UPDATE_FAILED', error.message || 'Profile update failed');
    }
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    try {
      console.log('🔄 Firebase Auth: Sending password reset email...');
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Firebase Auth: Password reset email sent');
    } catch (error: any) {
      console.error('❌ Firebase Auth: Password reset failed:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          throw new FirebaseAuthError('USER_NOT_FOUND', 'No user found with this email address');
        case 'auth/invalid-email':
          throw new FirebaseAuthError('INVALID_EMAIL', 'Invalid email address');
        default:
          throw new FirebaseAuthError('PASSWORD_RESET_FAILED', error.message || 'Password reset failed');
      }
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!auth.currentUser;
  },

  // Check if user has admin privileges
  isAdmin: (user: FirebaseUser | null): boolean => {
    return user?.role === 'super_admin' || user?.role === 'content_manager' || user?.role === 'community_manager';
  },

  // Check if user is super admin
  isSuperAdmin: (user: FirebaseUser | null): boolean => {
    return user?.role === 'super_admin';
  },

  // Auth state change listener
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await convertFirebaseUser(firebaseUser);
          callback(user);
        } catch (error) {
          console.error('❌ Error in auth state change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};
