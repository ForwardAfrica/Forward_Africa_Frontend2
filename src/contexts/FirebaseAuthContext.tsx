import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { firebaseAuthService, FirebaseUser, LoginCredentials, RegisterData, FirebaseAuthError } from '../lib/firebaseAuth';

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  profile: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<FirebaseUser>) => Promise<FirebaseUser>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;

    try {
      console.log('🔍 FirebaseAuthContext: Checking authentication status...');

      // Firebase Auth automatically handles auth state, so we just need to wait for it
      // The onAuthStateChanged listener will handle setting the user
      setLoading(false);
    } catch (error) {
      console.error('❌ FirebaseAuthContext: Auth check error:', error);
      setUser(null);
      setError('Authentication error. Please log in again.');
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set client flag on mount to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up Firebase Auth state listener
  useEffect(() => {
    if (!isClient) return;

    const unsubscribe = firebaseAuthService.onAuthStateChanged((firebaseUser) => {
      console.log('🔄 FirebaseAuthContext: Auth state changed:', firebaseUser?.email || 'No user');
      setUser(firebaseUser);
      setError(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isClient]);

  // Watch for authentication state changes and handle navigation
  useEffect(() => {
    if (!isClient) return;

    // If user becomes unauthenticated, redirect to appropriate page
    if (!user && !loading) {
      const currentPath = router.pathname;

      // Don't redirect if already on login/register pages or public pages
      const publicPaths = [
        '/login',
        '/register',
        '/',
        '/landing',
        '/about',
        '/afri-sage',
        '/community',
        '/courses', // Allow access to course listing
        '/category'
      ];
      const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

      if (!isPublicPath) {
        console.log('🚪 FirebaseAuthContext: User logged out, redirecting from', currentPath);

        // Show a brief notification to the user
        if (typeof window !== 'undefined') {
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc2626;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
          `;
          notification.textContent = 'Session expired. Redirecting to login...';
          document.body.appendChild(notification);

          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 3000);
        }

        // Redirect to login page, preserving the current path for post-login redirect
        router.push({
          pathname: '/login',
          query: { redirect: currentPath }
        });
      }
    }
  }, [user, loading, isClient, router]);

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 FirebaseAuthContext: Signing in...');

      // Validate credentials before sending
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (!credentials.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      await firebaseAuthService.signIn(credentials);
      console.log('✅ FirebaseAuthContext: Sign in successful');
    } catch (error) {
      console.error('❌ FirebaseAuthContext: Sign in error:', error);

      // Handle specific error types
      let errorMessage = 'Sign in failed';

      if (error instanceof FirebaseAuthError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('user-not-found')) {
          errorMessage = 'No account found with this email address.';
        } else if (error.message.includes('wrong-password')) {
          errorMessage = 'Incorrect password.';
        } else if (error.message.includes('too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 FirebaseAuthContext: Signing up...');

      await firebaseAuthService.signUp(data);
      console.log('✅ FirebaseAuthContext: Sign up successful');
    } catch (error) {
      console.error('❌ FirebaseAuthContext: Sign up error:', error);

      // Enhanced error handling for registration
      let errorMessage = 'Sign up failed';

      if (error instanceof FirebaseAuthError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        } else if (error.message.includes('weak-password')) {
          errorMessage = 'Password should be at least 6 characters.';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 FirebaseAuthContext: Signing in with Google...');

      await firebaseAuthService.signInWithGoogle();
      console.log('✅ FirebaseAuthContext: Google sign in successful');
    } catch (error) {
      console.error('❌ FirebaseAuthContext: Google sign in error:', error);

      let errorMessage = 'Google sign in failed';

      if (error instanceof FirebaseAuthError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        if (error.message.includes('popup-closed')) {
          errorMessage = 'Sign in was cancelled.';
        } else if (error.message.includes('popup-blocked')) {
          errorMessage = 'Popup was blocked. Please allow popups and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 FirebaseAuthContext: Signing out...');
      await firebaseAuthService.signOut();
      setUser(null);
      setError(null);
      console.log('✅ FirebaseAuthContext: Sign out successful');

      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error('❌ FirebaseAuthContext: Sign out error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setError(null);

      // Still redirect even if logout fails
      router.push('/');
    }
  };

  const updateProfile = async (profileData: Partial<FirebaseUser>) => {
    try {
      setError(null);
      console.log('🔄 FirebaseAuthContext: Updating profile with data:', profileData);

      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const updatedUser = await firebaseAuthService.updateProfile(user.uid, profileData);
      console.log('✅ FirebaseAuthContext: Profile updated, new user data:', updatedUser);

      // Update the user state with the new data
      setUser(updatedUser);
      console.log('✅ FirebaseAuthContext: User state updated with onboarding_completed:', updatedUser.onboarding_completed);

      return updatedUser;
    } catch (error) {
      console.error('❌ FirebaseAuthContext: Profile update error:', error);
      setError(error instanceof Error ? error.message : 'Profile update failed');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      console.log('🔄 FirebaseAuthContext: Sending password reset email...');
      await firebaseAuthService.resetPassword(email);
      console.log('✅ FirebaseAuthContext: Password reset email sent');
    } catch (error) {
      console.error('❌ FirebaseAuthContext: Password reset error:', error);

      let errorMessage = 'Password reset failed';

      if (error instanceof FirebaseAuthError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          errorMessage = 'No account found with this email address.';
        } else if (error.message.includes('invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    profile: user, // For compatibility with existing code
    loading: loading || !isClient, // Show loading until client-side hydration is complete
    isAuthenticated: !!user,
    isAdmin: firebaseAuthService.isAdmin(user),
    isSuperAdmin: firebaseAuthService.isSuperAdmin(user),
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    clearError,
    checkAuthStatus,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
