import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      console.log('🔍 AuthContext: Checking authentication status...');

      if (!authService.hasValidToken()) {
        console.log('🔍 AuthContext: No valid token found');
        setUser(null);
        return;
      }

      // Try to get user from token first
      const tokenUser = authService.getUserFromToken();
      if (tokenUser) {
        console.log('✅ AuthContext: User loaded from token:', tokenUser.email);
        setUser(tokenUser);
        setError(null);
        return;
      }

      // If no user from token, fetch from server
      const profileUser = await authService.getProfile();
      console.log('✅ AuthContext: User profile loaded:', profileUser.email);
      setUser(profileUser);
      setError(null);
    } catch (error) {
      console.error('❌ AuthContext: Auth check error:', error);
      setUser(null);
      setError('Authentication check failed');
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

  // Check authentication on mount
  useEffect(() => {
    if (!isClient) return;

    checkAuthStatus().finally(() => {
      setLoading(false);
    });
  }, [checkAuthStatus, isClient]);

  // Watch for token expiry and refresh
  useEffect(() => {
    if (!isClient || !user) return;

    const checkTokenExpiry = () => {
      const status = authService.getTokenStatus();
      
      if (status.isExpired) {
        console.log('⏳ Token expired, logging out');
        setUser(null);
        router.push({ pathname: '/login', query: { redirect: router.pathname } });
      } else if (authService.shouldRefreshToken()) {
        console.log('🔄 Token expiring soon, refreshing...');
        refreshToken().catch(() => {
          console.error('Failed to refresh token');
        });
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiry, 30 * 1000);

    // Also check on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTokenExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isClient, user, refreshToken, router]);

  // Redirect unauthenticated users from protected pages
  useEffect(() => {
    if (!isClient || loading) return;

    if (!user) {
      const currentPath = router.pathname;
      const publicPaths = ['/', '/login', '/register'];
      const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

      if (!isPublicPath) {
        console.log('🚪 AuthContext: Redirecting unauthenticated user');
        router.push({ pathname: '/login', query: { redirect: currentPath } });
      }
    }
  }, [user, loading, isClient, router]);

  // Redirect authenticated users from auth pages
  useEffect(() => {
    if (!isClient || loading) return;

    const authPages = ['/login', '/register'];
    const currentPath = router.pathname;

    if (user && authPages.some(p => currentPath === p)) {
      router.replace('/home');
    }
  }, [user, loading, isClient, router]);

  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 AuthContext: Signing in...');

      const response = await authService.login(credentials);
      setUser(response.user);
      console.log('✅ AuthContext: Sign in successful');
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
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'content_manager' || user?.role === 'community_manager',
    isSuperAdmin: user?.role === 'super_admin',
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
