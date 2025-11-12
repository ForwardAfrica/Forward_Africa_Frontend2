// Enhanced Authentication Service
// Handles login, registration, and token management with improved error handling

import { API_BASE_URL } from './mysql';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'content_manager' | 'community_manager' | 'user_support' | 'super_admin';
  permissions: string[];
  avatar_url?: string;
  onboarding_completed: boolean;
  industry?: string;
  experience_level?: string;
  business_stage?: string;
  country?: string;
  state_province?: string;
  city?: string;
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
  token: string;
  refreshToken: string;
  user: AuthUser;
  message: string;
}

export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
  message: string;
}



// Token management
const TOKEN_KEY = 'forward_africa_token';
const REFRESH_TOKEN_KEY = 'forward_africa_refresh_token';
const USER_KEY = 'forward_africa_user';
const TOKEN_EXPIRY_KEY = 'forward_africa_token_expiry';

// Token refresh configuration
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
let refreshPromise: Promise<TokenRefreshResponse> | null = null;

// Enhanced error handling
export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// JWT Token utilities
const jwtUtils = {
  // Parse JWT token without verification (for client-side expiry check)
  parseToken: (token: string): any => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      throw new AuthError('INVALID_TOKEN', 'Invalid token format');
    }
  },

  // Check if token is expired
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = jwtUtils.parseToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Consider invalid tokens as expired
    }
  },

  // Get token expiry time
  getTokenExpiry: (token: string): number | null => {
    try {
      const payload = jwtUtils.parseToken(token);
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return null;
    }
  }
};

export const authService = {
  // Store token and user data with enhanced error handling
  setAuthData: (token: string, refreshToken: string, user: AuthUser) => {
    if (typeof window !== 'undefined') {
      try {
        // Validate token format before storing
        if (!token || !refreshToken) {
          throw new AuthError('INVALID_TOKENS', 'Invalid token data provided');
        }

        // Parse and validate token
        const tokenPayload = jwtUtils.parseToken(token);
        // Check for both 'userId' and 'id' fields (backend uses different field names)
        const userId = tokenPayload.userId || tokenPayload.id;
        if (!userId || !tokenPayload.role) {
          throw new AuthError('INVALID_TOKEN_PAYLOAD', 'Token payload is missing required fields');
        }

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Store token expiry time
        const expiryTime = jwtUtils.getTokenExpiry(token);
        if (expiryTime) {
          localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        }

        // Store session timestamps for client-side session policy
        const now = Date.now();
        localStorage.setItem('forward_africa_session_start', now.toString());
        localStorage.setItem('forward_africa_last_activity', now.toString());

        console.log('✅ Auth data stored successfully');
      } catch (error) {
        console.error('❌ Failed to store auth data:', error);
        throw error;
      }
    }
  },

  // Get stored token with validation
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    // Check if token is expired
    if (jwtUtils.isTokenExpired(token)) {
      console.log('⚠️ Token is expired, clearing auth data');
      authService.clearAuthData();
      return null;
    }

    return token;
  },

  // Get stored refresh token
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Get stored user data with validation
  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;

    try {
      const userData = localStorage.getItem(USER_KEY);
      if (!userData) return null;

      const user = JSON.parse(userData);

      // Validate user data structure
      if (!user.id || !user.email || !user.role) {
        console.warn('⚠️ Invalid user data structure, clearing');
        authService.clearAuthData();
        return null;
      }

      return user;
    } catch (error) {
      console.error('❌ Failed to parse user data:', error);
      authService.clearAuthData();
      return null;
    }
  },

  // Get token expiry time
  getTokenExpiry: (): number | null => {
    if (typeof window === 'undefined') return null;

    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return null;

    const expiry = parseInt(expiryStr);
    return isNaN(expiry) ? null : expiry;
  },

  // Check if token is expired
  isTokenExpired: (): boolean => {
    const token = authService.getToken();
    if (!token) return true;
    return jwtUtils.isTokenExpired(token);
  },

  // Check if token should be refreshed
  shouldRefreshToken: (): boolean => {
    const expiry = authService.getTokenExpiry();
    if (!expiry) return true;

    const currentTime = Date.now();
    const timeUntilExpiry = expiry - currentTime;

    return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;
  },

  // Clear all auth data and user-specific data
  clearAuthData: () => {
    if (typeof window !== 'undefined') {
      // Clear auth tokens and user data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);

      // Clear all user-specific localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('profile_prompt_') ||
          key.startsWith('user_') ||
          key.startsWith('userLevel') ||
          key.startsWith('achievements') ||
          key.startsWith('learningStreak') ||
          key.startsWith('certificates') ||
          key.startsWith('notifications') ||
          key.startsWith('userBehavior_') ||
          key.startsWith('videoTracking_') ||
          key.startsWith('audit_logs')
        )) {
          keysToRemove.push(key);
        }
      }

      // Remove all user-specific keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 Cleared user data: ${key}`);
      });

      console.log('🧹 All auth and user data cleared');
    }
  },

  // Enhanced login (mocked for frontend-only UI)
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('🔐 Mock login (frontend-only UI)');

      if (!credentials.email || !credentials.password) {
        throw new AuthError('MISSING_CREDENTIALS', 'Email and password are required');
      }

      if (!credentials.email.includes('@')) {
        throw new AuthError('INVALID_EMAIL', 'Please enter a valid email address');
      }

      // Create a simple mock JWT token payload
      const payload = {
        id: credentials.email,
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 24 * 3600
      };

      const base64Payload = (typeof window !== 'undefined' && typeof btoa === 'function')
        ? btoa(JSON.stringify(payload))
        : Buffer.from(JSON.stringify(payload)).toString('base64');

      const token = `mock.${base64Payload}.sig`;
      const refreshToken = `mock-refresh-${Date.now()}`;

      const user: AuthUser = {
        id: payload.id,
        email: credentials.email,
        full_name: '',
        role: 'user',
        permissions: [],
        onboarding_completed: false
      };

      authService.setAuthData(token, refreshToken, user);

      return {
        token,
        refreshToken,
        user,
        message: 'Logged in (mock)'
      };
    } catch (error) {
      console.error('❌ Mock login failed:', error);
      if (error instanceof AuthError) throw error;
      throw new AuthError('UNKNOWN_ERROR', 'An unexpected error occurred');
    }
  },

  // Enhanced register (mocked for frontend-only UI)
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('📝 Mock registration (frontend-only UI)');

      if (!userData.email || !userData.password || !userData.full_name) {
        throw new AuthError('MISSING_DATA', 'Email, password, and full name are required');
      }

      if (!userData.email.includes('@')) {
        throw new AuthError('INVALID_EMAIL', 'Please enter a valid email address');
      }

      if (userData.password.length < 6) {
        throw new AuthError('WEAK_PASSWORD', 'Password must be at least 6 characters long');
      }

      if (userData.full_name.trim().length < 2) {
        throw new AuthError('INVALID_NAME', 'Full name must be at least 2 characters long');
      }

      // Create mock token
      const payload = {
        id: userData.email,
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 24 * 3600
      };

      const base64Payload = (typeof window !== 'undefined' && typeof btoa === 'function')
        ? btoa(JSON.stringify(payload))
        : Buffer.from(JSON.stringify(payload)).toString('base64');

      const token = `mock.${base64Payload}.sig`;
      const refreshToken = `mock-refresh-${Date.now()}`;

      const user = {
        id: payload.id,
        email: userData.email,
        full_name: userData.full_name,
        role: 'user',
        permissions: [],
        onboarding_completed: false
      } as AuthUser;

      authService.setAuthData(token, refreshToken, user);

      return {
        token,
        refreshToken,
        user,
        message: 'Account created (mock)'
      };
    } catch (error) {
      console.error('❌ Mock registration failed:', error);
      if (error instanceof AuthError) throw error;
      throw new AuthError('UNKNOWN_ERROR', 'An unexpected error occurred');
    }
  },

  // Enhanced logout
  logout: async (): Promise<void> => {
    try {
      console.log('🚪 Logging out...');

      const token = authService.getToken();

      if (token) {
        // Call logout endpoint to invalidate refresh token
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignore logout endpoint errors, still clear local data
          console.warn('⚠️ Logout endpoint failed, but clearing local data');
        });
      }
    } catch (error) {
      console.warn('⚠️ Logout error:', error);
    } finally {
      // Always clear local data
      authService.clearAuthData();
      console.log('✅ Logout completed');
    }
  },

  // Enhanced token refresh with retry logic
  refreshToken: async (): Promise<TokenRefreshResponse> => {
    // If there's already a refresh in progress, return the existing promise
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        console.log('🔄 Refreshing token...');

        const refreshToken = authService.getRefreshToken();
        if (!refreshToken) {
          throw new AuthError('NO_REFRESH_TOKEN', 'No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

          switch (response.status) {
            case 401:
              throw new AuthError('INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
            case 500:
              throw new AuthError('SERVER_ERROR', 'Token refresh failed due to server error');
            default:
              throw new AuthError('REFRESH_FAILED', errorData.error || 'Token refresh failed');
          }
        }

        const data: TokenRefreshResponse = await response.json();

        // Validate response
        if (!data.token || !data.refreshToken) {
          throw new AuthError('INVALID_REFRESH_RESPONSE', 'Invalid refresh response from server');
        }

        // Update stored tokens
        const user = authService.getUser();
        if (user) {
          authService.setAuthData(data.token, data.refreshToken, user);
        }

        console.log('✅ Token refreshed successfully');
        return data;
      } catch (error) {
        console.error('❌ Token refresh failed:', error);

        // Clear auth data on refresh failure
        authService.clearAuthData();

        if (error instanceof AuthError) {
          throw error;
        }

        throw new AuthError('REFRESH_FAILED', 'Token refresh failed');
      }
    })();

    return refreshPromise;
  },

  // Get valid token (refresh if needed)
  getValidToken: async (): Promise<string> => {
    const token = authService.getToken();

    if (!token) {
      throw new AuthError('NO_TOKEN', 'No authentication token');
    }

    // If token is expired or will expire soon, refresh it
    if (authService.shouldRefreshToken()) {
      try {
        const refreshResponse = await authService.refreshToken();
        return refreshResponse.token;
      } catch (error) {
        // If refresh fails, clear auth data and throw error
        authService.clearAuthData();
        throw new AuthError('SESSION_EXPIRED', 'Session expired. Please login again.');
      }
    }

    return token;
  },

  // Enhanced profile fetching
  getProfile: async (): Promise<AuthUser> => {
    try {
      const token = await authService.getValidToken();

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        switch (response.status) {
          case 401:
            throw new AuthError('UNAUTHORIZED', 'Authentication required');
          case 404:
            throw new AuthError('PROFILE_NOT_FOUND', 'User profile not found');
          default:
            throw new AuthError('PROFILE_FETCH_FAILED', errorData.error || 'Failed to fetch profile');
        }
      }

      const user: AuthUser = await response.json();

      // Validate user data
      if (!user.id || !user.email || !user.role) {
        throw new AuthError('INVALID_PROFILE', 'Invalid profile data received');
      }

      return user;
    } catch (error) {
      console.error('❌ Profile fetch failed:', error);

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError('PROFILE_FETCH_FAILED', 'Failed to fetch user profile');
    }
  },

  // Enhanced profile update
  updateProfile: async (profileData: Partial<AuthUser>): Promise<AuthUser> => {
    try {
      const token = await authService.getValidToken();
      const currentUser = authService.getUser();

      if (!currentUser) {
        throw new AuthError('NO_USER', 'No user data available');
      }

      console.log('🔄 AuthService: Updating profile for user:', currentUser.id);
      console.log('🔄 AuthService: Profile data:', profileData);
      console.log('🔄 AuthService: API URL:', `${API_BASE_URL}/users/${currentUser.id}`);

      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        switch (response.status) {
          case 400:
            throw new AuthError('INVALID_DATA', errorData.error || 'Invalid profile data');
          case 401:
            throw new AuthError('UNAUTHORIZED', 'Authentication required');
          case 404:
            throw new AuthError('USER_NOT_FOUND', 'User not found');
          default:
            throw new AuthError('UPDATE_FAILED', errorData.error || 'Profile update failed');
        }
      }

      const updatedUser: AuthUser = await response.json();
      console.log('✅ AuthService: Profile update response:', updatedUser);

      // Update stored user data
      const currentToken = authService.getToken();
      const currentRefreshToken = authService.getRefreshToken();

      if (currentToken && currentRefreshToken) {
        authService.setAuthData(currentToken, currentRefreshToken, updatedUser);
      }

      console.log('✅ Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('❌ Profile update failed:', error);

      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError('UPDATE_FAILED', 'Failed to update profile');
    }
  },

  // Check if user has admin privileges
  isAdmin: (): boolean => {
    const user = authService.getUser();
    return user?.role === 'super_admin';
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    const user = authService.getUser();
    return !!(token && user && !authService.isTokenExpired());
  },
};

// Enhanced authenticated request with automatic token refresh
export const authenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await authService.getValidToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle 401 errors with token refresh
    if (response.status === 401) {
      try {
        await authService.refreshToken();
        const newToken = await authService.getValidToken();

        // Retry the request with new token
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!retryResponse.ok) {
          throw new AuthError('REQUEST_FAILED', `Request failed: ${retryResponse.status}`);
        }

        return retryResponse;
      } catch (refreshError) {
        // If refresh fails, clear auth data
        authService.clearAuthData();
        throw new AuthError('SESSION_EXPIRED', 'Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      throw new AuthError('REQUEST_FAILED', `Request failed: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('❌ Authenticated request failed:', error);

    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError('REQUEST_FAILED', 'Request failed');
  }
};

// Setup automatic token refresh (legacy function - use setupAutomaticRefresh from authInterceptor instead)
export const setupAutomaticRefreshLegacy = (): (() => void) | undefined => {
  if (typeof window === 'undefined') return undefined;

  const checkAndRefreshToken = async () => {
    try {
      if (authService.shouldRefreshToken() && authService.getToken()) {
        console.log('🔄 Auto-refreshing token...');
        await authService.refreshToken();
      }
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
    }
  };

  // Check every minute
  const interval = setInterval(checkAndRefreshToken, 60 * 1000);

  // Also check when the page becomes visible
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      checkAndRefreshToken();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

// Check token status (legacy function - use checkTokenStatus from authInterceptor instead)
export const checkTokenStatusLegacy = () => {
  const token = authService.getToken();
  const expiry = authService.getTokenExpiry();

  if (!token) {
    return { isValid: false, isExpired: true, timeUntilExpiry: 0 };
  }

  if (!expiry) {
    return { isValid: true, isExpired: false, timeUntilExpiry: null };
  }

  const currentTime = Date.now();
  const timeUntilExpiry = expiry - currentTime;
  const isExpired = timeUntilExpiry <= 0;

  return {
    isValid: !isExpired,
    isExpired,
    timeUntilExpiry: Math.max(0, timeUntilExpiry),
  };
};
