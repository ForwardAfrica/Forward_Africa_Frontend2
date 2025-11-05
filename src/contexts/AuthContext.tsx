import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { authService, AuthUser, LoginCredentials, RegisterData } from '../lib/auth';
import { useFirebaseAuth } from './FirebaseAuthContext';

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<AuthUser>) => Promise<AuthUser>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  try {
    // Try to use the AuthContext first (for backward compatibility)
    const context = useContext(AuthContext);
    if (context !== undefined) {
      return context;
    }
  } catch {
    // Fall through to Firebase Auth
  }

  // Fall back to Firebase Auth for client-side rendering
  const firebaseAuth = useFirebaseAuth();

  // Convert Firebase auth response to the expected AuthUser format
  const convertedUser = firebaseAuth.user ? {
    id: firebaseAuth.user.uid,
    email: firebaseAuth.user.email || '',
    full_name: firebaseAuth.user.displayName || '',
    role: firebaseAuth.user.role,
    permissions: firebaseAuth.user.permissions,
    avatar_url: firebaseAuth.user.photoURL || undefined,
    onboarding_completed: firebaseAuth.user.onboarding_completed,
    industry: firebaseAuth.user.industry,
    experience_level: firebaseAuth.user.experience_level,
    business_stage: firebaseAuth.user.business_stage,
    country: firebaseAuth.user.country,
    state_province: firebaseAuth.user.state_province,
    city: firebaseAuth.user.city,
  } as AuthUser : null;

  return {
    user: convertedUser,
    profile: convertedUser,
    loading: firebaseAuth.loading,
    isAuthenticated: firebaseAuth.isAuthenticated,
    isAdmin: firebaseAuth.isAdmin,
    isSuperAdmin: firebaseAuth.isSuperAdmin,
    error: firebaseAuth.error,
    signIn: firebaseAuth.signIn as (credentials: LoginCredentials) => Promise<void>,
    signUp: firebaseAuth.signUp as (data: RegisterData) => Promise<void>,
    signOut: firebaseAuth.signOut,
    updateProfile: async (profileData: Partial<AuthUser>) => {
      const updated = await firebaseAuth.updateProfile(profileData as any);
      return {
        id: updated.uid,
        email: updated.email || '',
        full_name: updated.displayName || '',
        role: updated.role,
        permissions: updated.permissions,
        avatar_url: updated.photoURL || undefined,
        onboarding_completed: updated.onboarding_completed,
        industry: updated.industry,
        experience_level: updated.experience_level,
        business_stage: updated.business_stage,
        country: updated.country,
        state_province: updated.state_province,
        city: updated.city,
      } as AuthUser;
    },
    refreshToken: async () => {
      // Firebase handles token refresh automatically
    },
    clearError: firebaseAuth.clearError,
    checkAuthStatus: firebaseAuth.checkAuthStatus,
  };
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;

    try {
      console.log('🔍 AuthContext: Checking authentication status...');
      const token = authService.getToken();

      if (!token) {
        console.log('🔍 AuthContext: No token found');
        setUser(null);
        return;
      }

      console.log('🔍 AuthContext: Token found, validating...');
      const user = await authService.getProfile();
      console.log('✅ AuthContext: User profile loaded:', user?.email);
      setUser(user);
      setError(null);
    } catch (error) {
      console.error('❌ AuthContext: Auth check error:', error);
      // Clear invalid auth data
      authService.clearAuthData();
      setUser(null);
      setError('Authentication expired. Please log in again.');
    }
  }, []);

  // Enhanced refresh token with better error handling
  const refreshToken = useCallback(async () => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      console.log('🔄 AuthContext: Refreshing token...');

      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Token refresh failed' }));
        throw new Error(errorData.error || 'Token refresh failed');
      }

      const data = await response.json();

      // Validate response data
      if (!data.token || !data.refreshToken) {
        throw new Error('Invalid refresh response');
      }

      // Update stored tokens
      const currentUser = authService.getUser();
      if (currentUser) {
        authService.setAuthData(data.token, data.refreshToken, currentUser);
      }

      setError(null);
      console.log('✅ AuthContext: Token refreshed successfully');
    } catch (error) {
      console.error('❌ AuthContext: Token refresh failed:', error);
      authService.clearAuthData();
      setUser(null);
      setError('Session expired. Please log in again.');
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

  // Check authentication status only after client-side hydration
  useEffect(() => {
    if (!isClient) return;

    // Check for existing authentication on app load
    checkAuthStatus().finally(() => {
      setLoading(false);
    });
  }, [checkAuthStatus, isClient]);

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
        console.log('🚪 AuthContext: User logged out, redirecting from', currentPath);

        // Show a brief notification to the user
        if (typeof window !== 'undefined') {
          // Create a simple notification
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

          // Remove notification after 3 seconds
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

  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 AuthContext: Signing in...');

      // Validate credentials before sending
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (!credentials.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      const response = await authService.login(credentials);
      setUser(response.user);
      console.log('✅ AuthContext: Sign in successful');
    } catch (error) {
      console.error('❌ AuthContext: Sign in error:', error);

      // Handle specific error types
      let errorMessage = 'Sign in failed';

      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Invalid email or password.';
        } else if (error.message.includes('500') || error.message.includes('Internal server')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          errorMessage = 'Too many login attempts. Please wait a moment.';
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

  const signUp = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 AuthContext: Signing up...');

      const response = await authService.register(data);
      setUser(response.user);
      console.log('✅ AuthContext: Sign up successful');
    } catch (error) {
      console.error('❌ AuthContext: Sign up error:', error);

      // Enhanced error handling for registration
      let errorMessage = 'Sign up failed';

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('User already exists') ||
            error.message.includes('EMAIL_EXISTS') ||
            error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.message.includes('WEAK_PASSWORD')) {
          errorMessage = 'Password should be at least 6 characters.';
        } else if (error.message.includes('INVALID_EMAIL')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('MISSING_DATA')) {
          errorMessage = 'Please fill in all required fields.';
        } else if (error.message.includes('500') || error.message.includes('Internal server')) {
          errorMessage = 'Server error. Please try again later.';
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
      console.log('🚪 AuthContext: Signing out...');
      authService.logout();
      setUser(null);
      setError(null);
      console.log('✅ AuthContext: Sign out successful');

      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error('❌ AuthContext: Sign out error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setError(null);

      // Still redirect even if logout fails
      router.push('/');
    }
  };

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    try {
      setError(null);
      console.log('🔄 AuthContext: Updating profile with data:', profileData);
      const updatedUser = await authService.updateProfile(profileData);
      console.log('✅ AuthContext: Profile updated, new user data:', updatedUser);

      // Update the user state with the new data
      setUser(updatedUser);
      console.log('✅ AuthContext: User state updated with onboarding_completed:', updatedUser.onboarding_completed);

      return updatedUser;
    } catch (error) {
      console.error('❌ AuthContext: Profile update error:', error);
      setError(error instanceof Error ? error.message : 'Profile update failed');
      throw error;
    }
  };

  const value = {
    user,
    profile: user, // For compatibility with existing code
    loading: loading || !isClient, // Show loading until client-side hydration is complete
    isAuthenticated: !!user,
    isAdmin: user?.role === 'super_admin' || user?.role === 'content_manager' || user?.role === 'community_manager',
    isSuperAdmin: user?.role === 'super_admin',
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshToken,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
