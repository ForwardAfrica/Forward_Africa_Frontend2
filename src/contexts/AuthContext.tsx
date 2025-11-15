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
  checkAuthStatus: () => void;
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
  
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRedirectingRef = useRef(false);

  // Initialize user from JWT token in cookies (no API calls)
  const initializeUserFromToken = useCallback(() => {
    try {
      console.log('🔍 AuthContext: Initializing user from JWT token...');

      const token = authService.getTokenFromCookie();
      if (!token) {
        console.log('🔍 AuthContext: No token in cookie');
        setUser(null);
        return;
      }

      console.log('🔍 AuthContext: Token found in cookie, validating...');

      // Check if token is expired
      const tokenStatus = authService.getTokenStatus();
      console.log('🔍 AuthContext: Token status:', tokenStatus);

      if (tokenStatus.isExpired) {
        console.log('⏳ AuthContext: Token is expired');
        setUser(null);
        return;
      }

      // Decode user from token
      try {
        const userFromToken = authService.getUserFromToken();
        if (userFromToken) {
          console.log('✅ AuthContext: User loaded from token:', userFromToken);
          setUser(userFromToken);
        } else {
          console.log('❌ AuthContext: getUserFromToken() returned null');
          setUser(null);
        }
      } catch (decodeError) {
        console.error('❌ AuthContext: Error decoding user from token:', decodeError);
        setUser(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error initializing from token:', error);
      setUser(null);
    }
  }, []);

  // Set client flag and initialize on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication on mount (synchronous, just decode token)
  useEffect(() => {
    if (!isClient) return;

    initializeUserFromToken();
    setLoading(false);
  }, [isClient, initializeUserFromToken]);

  // Re-initialize user when page becomes visible (handles tab switching)
  useEffect(() => {
    if (!isClient) return;

    const handleVisibilityChange = () => {
      if (document.hidden === false) {
        console.log('📱 AuthContext: Page became visible, checking auth status...');
        initializeUserFromToken();
      }
    };

    const handleWindowFocus = () => {
      console.log('🔍 AuthContext: Window focused, checking auth status...');
      initializeUserFromToken();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isClient, initializeUserFromToken]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!isClient || loading || !user) return;

    let tokenRefreshInterval: NodeJS.Timeout | null = null;

    const scheduleTokenRefresh = () => {
      const expiry = authService.getTokenExpiryMs();
      if (!expiry) return;

      const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
      const timeUntilExpiry = Math.max(0, expiry - Date.now());
      const timeUntilRefresh = timeUntilExpiry - TOKEN_REFRESH_THRESHOLD;

      if (timeUntilRefresh > 0) {
        console.log(`🔄 Scheduling token refresh in ${Math.floor(timeUntilRefresh / 1000)}s`);
        
        if (tokenRefreshInterval) clearTimeout(tokenRefreshInterval);
        
        tokenRefreshInterval = setTimeout(async () => {
          console.log('🔄 Auto-refreshing token...');
          try {
            const response = await authService.refreshToken();
            if (response && response.user) {
              setUser(response.user);
              console.log('✅ Token refreshed and user updated');
              scheduleTokenRefresh();
            }
          } catch (error) {
            console.error('❌ Token refresh failed:', error);
            setUser(null);
          }
        }, timeUntilRefresh);
      }
    };

    scheduleTokenRefresh();

    return () => {
      if (tokenRefreshInterval) clearTimeout(tokenRefreshInterval);
    };
  }, [isClient, loading, user]);

  // Redirect unauthenticated users from protected pages
  useEffect(() => {
    if (!isClient || loading) return;

    // If no user and not already redirecting
    if (!user && !isRedirectingRef.current) {
      const currentPath = router.pathname;
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));

      if (!isPublicPath) {
        console.log('🚪 Redirecting to login from:', currentPath);
        isRedirectingRef.current = true;

        if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);

        redirectTimeoutRef.current = setTimeout(() => {
          router.replace('/login');
          isRedirectingRef.current = false;
        }, 100);
      }
    } else if (user) {
      // User is authenticated, clear any pending redirects
      isRedirectingRef.current = false;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    }

    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, [user, loading, isClient, router]);

  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 AuthContext: Signing in...');

      const response = await authService.login(credentials);

      // Use user data from response instead of decoding token
      // The response contains the decoded user object from the server
      if (response.user) {
        setUser(response.user);
        console.log('✅ User signed in:', response.user.email);

        // Set redirect flag to prevent interference
        isRedirectingRef.current = true;
        await router.replace('/home');
        setTimeout(() => {
          isRedirectingRef.current = false;
        }, 500);
      } else {
        throw new AuthError('LOGIN_FAILED', 'No user data in login response');
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);

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
      isRedirectingRef.current = false;
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

      // Use user data from response
      if (response.user) {
        setUser(response.user);
        console.log('✅ User signed up:', response.user.email);
      }
    } catch (error) {
      console.error('❌ Sign up error:', error);

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
      console.log('✅ Sign out successful');
      router.push('/');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      setUser(null);
      setError(null);
      router.push('/');
    }
  };

  const refreshToken = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      console.log('🔄 AuthContext: Refreshing token...');
      const response = await authService.refreshToken();

      if (response && response.user) {
        setUser(response.user);
        setError(null);
        console.log('✅ Token refreshed');
        return;
      }

      console.error('❌ Token refresh failed - no user data');
      setUser(null);
      setError('Session expired. Please log in again.');
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      setUser(null);
      setError('Session expired. Please log in again.');
    }
  }, []);

  const updateProfile = async (profileData: Partial<AuthUser>) => {
    try {
      setError(null);
      console.log('🔄 AuthContext: Updating profile...');

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
      console.log('✅ Profile updated');
      return updatedUser;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setError('Failed to update profile');
      throw error;
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    profile: user,
    loading: loading || !isClient,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'super_admin' || user?.role === 'content_manager',
    isSuperAdmin: user?.role === 'super_admin',
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshToken,
    clearError,
    checkAuthStatus: initializeUserFromToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
