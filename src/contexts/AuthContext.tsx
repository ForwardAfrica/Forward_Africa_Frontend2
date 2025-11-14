import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { authService, AuthUser, LoginCredentials, RegisterData, AuthError } from '../lib/authService';

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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
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
  
  // Track redirects to prevent infinite redirect loops
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRedirectingRef = useRef(false);
  const authCheckInProgressRef = useRef(false);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (authCheckInProgressRef.current) return; // Prevent concurrent checks

    authCheckInProgressRef.current = true;

    try {
      console.log('🔍 AuthContext: Checking authentication status...');

      // First, check if there's a token in the cookie
      const token = authService.getTokenFromCookie();
      if (!token) {
        console.log('🔍 AuthContext: No token in cookie');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ AuthContext: Token found in cookie, fetching user profile...');

      // Fetch user profile from server
      try {
        const profileUser = await authService.getProfile();
        console.log('✅ AuthContext: User profile loaded:', profileUser.email);
        setUser(profileUser);
        setError(null);
      } catch (error) {
        console.error('❌ AuthContext: Failed to fetch profile:', error);
        // Token might be invalid or expired, clear it
        setUser(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: Auth check error:', error);
      setUser(null);
      setError('Authentication check failed');
    } finally {
      authCheckInProgressRef.current = false;
      setLoading(false);
    }
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      console.log('🔄 AuthContext: Refreshing token...');

      const response = await authService.refreshToken();
      
      if (response.user) {
        setUser(response.user);
        setError(null);
      }

      console.log('✅ AuthContext: Token refreshed successfully');
    } catch (error) {
      console.error('❌ AuthContext: Token refresh failed:', error);
      setUser(null);
      setError('Session expired. Please log in again.');
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication on mount only
  useEffect(() => {
    if (!isClient) return;

    checkAuthStatus().finally(() => {
      setLoading(false);
    });
  }, [checkAuthStatus, isClient]);

  // Single consolidated effect for token management and redirects
  useEffect(() => {
    if (!isClient || loading) return;

    let tokenCheckInterval: NodeJS.Timeout | null = null;

    const performTokenCheck = () => {
      const status = authService.getTokenStatus();
      
      if (status.isExpired) {
        console.log('⏳ Token expired, logging out');
        setUser(null);
        
        // Clear any pending redirects
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }
        
        // Redirect to login with a small delay to ensure state is updated
        if (!isRedirectingRef.current) {
          isRedirectingRef.current = true;
          redirectTimeoutRef.current = setTimeout(() => {
            // Redirect directly to login without query params to prevent loops
            router.replace('/login');
            isRedirectingRef.current = false;
          }, 100);
        }
      } else if (authService.shouldRefreshToken()) {
        console.log('🔄 Token expiring soon, refreshing...');
        refreshToken().catch(() => {
          console.error('Failed to refresh token');
        });
      }
    };

    // Check token every 60 seconds instead of 30 to reduce noise
    tokenCheckInterval = setInterval(performTokenCheck, 60 * 1000);

    // Also check on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        performTokenCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (tokenCheckInterval) clearInterval(tokenCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isClient, loading, refreshToken, router]);

  // Redirect unauthenticated users from protected pages - only when user state changes
  useEffect(() => {
    if (!isClient || loading) return;

    if (!user) {
      const currentPath = router.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

      // Only redirect if user is on a protected page and not already redirecting
      if (!isPublicPath && !isRedirectingRef.current) {
        console.log('🚪 AuthContext: Redirecting unauthenticated user from protected page:', currentPath);
        isRedirectingRef.current = true;

        // Clear any pending redirects
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }

        // Don't add redirect query param to prevent loops
        // Just redirect directly to login
        redirectTimeoutRef.current = setTimeout(() => {
          console.log('🚀 Performing redirect to login');
          router.replace('/login');
          isRedirectingRef.current = false;
        }, 100);
      }
    } else {
      // User is authenticated, clear redirect flag
      isRedirectingRef.current = false;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [user, loading, isClient, router]);


  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 AuthContext: Signing in...');

      const response = await authService.login(credentials);
      setUser(response.user);
      console.log('✅ AuthContext: Sign in successful, user:', response.user);

      // Redirect to home after successful login
      console.log('📍 Redirecting to: /home');
      router.replace('/home');
    } catch (error) {
      console.error('❌ AuthContext: Sign in error:', error);

      let errorMessage = 'Sign in failed';

      if (error instanceof AuthError) {
        switch (error.code) {
          case 'INVALID_CREDENTIALS':
          case 'UNAUTHORIZED':
            errorMessage = 'Invalid email or password';
            break;
          case 'RATE_LIMITED':
            errorMessage = 'Too many login attempts. Please wait a moment.';
            break;
          case 'MISSING_CREDENTIALS':
            errorMessage = 'Please enter both email and password';
            break;
          case 'INVALID_EMAIL':
            errorMessage = 'Please enter a valid email address';
            break;
          default:
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

      // Don't auto-redirect - let the page that called signUp decide where to redirect
      // Usually the page will handle the redirect or let the user proceed naturally
    } catch (error) {
      console.error('❌ AuthContext: Sign up error:', error);

      let errorMessage = 'Sign up failed';

      if (error instanceof AuthError) {
        switch (error.code) {
          case 'EMAIL_EXISTS':
            errorMessage = 'This email is already registered. Please try logging in.';
            break;
          case 'INVALID_EMAIL':
            errorMessage = 'Please enter a valid email address';
            break;
          case 'WEAK_PASSWORD':
            errorMessage = 'Password must be at least 6 characters';
            break;
          case 'MISSING_DATA':
            errorMessage = 'Please fill in all required fields';
            break;
          default:
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
      await authService.logout();
      setUser(null);
      setError(null);
      console.log('✅ AuthContext: Sign out successful');
      router.push('/');
    } catch (error) {
      console.error('❌ AuthContext: Sign out error:', error);
      // Clear local state even if logout fails
      setUser(null);
      setError(null);
      router.push('/');
    }
  };

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    try {
      setError(null);
      console.log('🔄 AuthContext: Updating profile...');

      // Make authenticated request to update profile
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser: AuthUser = await response.json();
      setUser(updatedUser);
      console.log('✅ AuthContext: Profile updated');

      return updatedUser;
    } catch (error) {
      console.error('❌ AuthContext: Profile update error:', error);
      setError('Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    profile: user,
    loading: loading || !isClient,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin' || user?.role === 'Super Admin',
    isSuperAdmin: user?.role === 'Super Admin',
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshToken,
    clearError,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
