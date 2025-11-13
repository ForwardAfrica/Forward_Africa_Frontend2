// Cookie-based JWT Authentication Service
// Handles login, registration, token refresh with JWT tokens stored in HTTP-only cookies

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  displayName?: string;
  photoURL?: string | null;
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
  [key: string]: any;
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
  message: string;
  user: AuthUser;
  token?: string;
}

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

// JWT Token utilities for client-side verification
const jwtUtils = {
  base64UrlDecode(str: string): string {
    str += new Array(5 - str.length % 4).join('=');
    return Buffer.from(
      str.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf8');
  },

  parseToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      if (!payload) throw new Error('Invalid token');
      return JSON.parse(jwtUtils.base64UrlDecode(payload));
    } catch (error) {
      throw new AuthError('INVALID_TOKEN', 'Invalid token format');
    }
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = jwtUtils.parseToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  getTokenExpiry(token: string): number | null {
    try {
      const payload = jwtUtils.parseToken(token);
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return null;
    }
  }
};

// Main authentication service
export const authService = {
  // Check if token exists and is valid
  hasValidToken(): boolean {
    if (typeof document === 'undefined') return false;

    // Check cookie first, then fallback to localStorage
    const token = this.getToken();
    if (!token) return false;

    return !jwtUtils.isTokenExpired(token);
  },

  // Get token from cookie
  getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' && value) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },

  // Get token from localStorage (deprecated - use cookies only)
  getTokenFromStorage(): string | null {
    // Deprecated: Only use cookies for authentication
    return null;
  },

  // Set token in localStorage (deprecated - use cookies only)
  setTokenInStorage(token: string): void {
    // Deprecated: Tokens are now stored in cookies only
    // This method is kept for backward compatibility but does nothing
  },

  // Clear token from localStorage (deprecated)
  clearTokenFromStorage(): void {
    // Deprecated: Tokens are stored in cookies only
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem('auth_token');
  },

  // Get token for API requests (from cookies only)
  getToken(): string | null {
    return this.getTokenFromCookie();
  },

  // Parse token to get user data
  getUserFromToken(): AuthUser | null {
    // Use cookies only for token retrieval
    const token = this.getTokenFromCookie();
    if (!token) return null;

    try {
      const payload = jwtUtils.parseToken(token);
      // Check expiration
      if (jwtUtils.isTokenExpired(token)) {
        return null;
      }

      // Convert token payload to AuthUser format
      return {
        id: payload.userId,
        email: payload.email,
        full_name: payload.displayName || '',
        displayName: payload.displayName || '',
        photoURL: payload.photoURL || null,
        role: payload.role || 'user',
        permissions: payload.permissions || [],
        avatar_url: payload.photoURL || undefined,
        onboarding_completed: payload.onboarding_completed || false
      };
    } catch (error) {
      return null;
    }
  },

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new AuthError('MISSING_CREDENTIALS', 'Email and password are required');
      }

      if (!credentials.email.includes('@')) {
        throw new AuthError('INVALID_EMAIL', 'Please enter a valid email address');
      }

      console.log('🔐 AuthService: Logging in...');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));

        switch (response.status) {
          case 400:
            throw new AuthError('INVALID_CREDENTIALS', errorData.error || 'Invalid credentials');
          case 401:
            throw new AuthError('UNAUTHORIZED', errorData.error || 'Invalid email or password');
          case 429:
            throw new AuthError('RATE_LIMITED', errorData.error || 'Too many login attempts');
          default:
            throw new AuthError('LOGIN_FAILED', errorData.error || 'Login failed');
        }
      }

      const data: AuthResponse = await response.json();
      console.log('✅ AuthService: Login successful');

      // Token is stored in cookies by the server
      // No need to store in localStorage - use cookies only for security

      return data;
    } catch (error) {
      console.error('❌ AuthService: Login error:', error);
      if (error instanceof AuthError) throw error;
      throw new AuthError('LOGIN_FAILED', 'Login failed');
    }
  },

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      if (!userData.email || !userData.password || !userData.full_name) {
        throw new AuthError('MISSING_DATA', 'Email, password, and full name are required');
      }

      if (!userData.email.includes('@')) {
        throw new AuthError('INVALID_EMAIL', 'Please enter a valid email address');
      }

      if (userData.password.length < 6) {
        throw new AuthError('WEAK_PASSWORD', 'Password must be at least 6 characters');
      }

      console.log('📝 AuthService: Registering user...');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));

        switch (response.status) {
          case 400:
            throw new AuthError('INVALID_DATA', errorData.error || 'Invalid registration data');
          case 409:
            throw new AuthError('EMAIL_EXISTS', errorData.error || 'Email already exists');
          default:
            throw new AuthError('REGISTER_FAILED', errorData.error || 'Registration failed');
        }
      }

      const data: AuthResponse = await response.json();
      console.log('✅ AuthService: Registration successful');

      // Token is stored in cookies by the server
      // No need to store in localStorage - use cookies only for security

      return data;
    } catch (error) {
      console.error('❌ AuthService: Registration error:', error);
      if (error instanceof AuthError) throw error;
      throw new AuthError('REGISTER_FAILED', 'Registration failed');
    }
  },

  // Get current user profile from server
  async getProfile(): Promise<AuthUser> {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Include cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthError('UNAUTHORIZED', 'Authentication required');
        }
        throw new AuthError('PROFILE_FETCH_FAILED', 'Failed to fetch profile');
      }

      const user: AuthUser = await response.json();
      return user;
    } catch (error) {
      console.error('❌ AuthService: Profile fetch error:', error);
      if (error instanceof AuthError) throw error;
      throw new AuthError('PROFILE_FETCH_FAILED', 'Failed to fetch profile');
    }
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      console.log('🔄 AuthService: Refreshing token...');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Include cookies
      });

      if (!response.ok) {
        throw new AuthError('REFRESH_FAILED', 'Token refresh failed');
      }

      const data: AuthResponse = await response.json();
      console.log('✅ AuthService: Token refreshed');

      // Store refreshed token in localStorage
      if (data.token) {
        this.setTokenInStorage(data.token);
      }

      return data;
    } catch (error) {
      console.error('❌ AuthService: Token refresh error:', error);
      throw new AuthError('REFRESH_FAILED', 'Token refresh failed');
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      console.log('🚪 AuthService: Logging out...');

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Include cookies
      }).catch(() => {
        // Ignore errors, still clear local state
        console.warn('⚠️ Logout endpoint failed');
      });

      // Clear token from storage
      this.clearTokenFromStorage();

      console.log('✅ AuthService: Logout completed');
    } catch (error) {
      console.warn('⚠️ AuthService: Logout error:', error);
      // Still clear token even if logout fails
      this.clearTokenFromStorage();
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.hasValidToken();
  },

  // Get token expiry time in milliseconds
  getTokenExpiryMs(): number | null {
    const token = this.getToken();
    if (!token) return null;
    return jwtUtils.getTokenExpiry(token);
  },

  // Check if token should be refreshed
  shouldRefreshToken(): boolean {
    const expiry = this.getTokenExpiryMs();
    if (!expiry) return true;

    const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
    const currentTime = Date.now();
    const timeUntilExpiry = expiry - currentTime;

    return timeUntilExpiry <= TOKEN_REFRESH_THRESHOLD;
  },

  // Get token status
  getTokenStatus(): { isValid: boolean; isExpired: boolean; timeUntilExpiry: number | null } {
    const token = this.getToken();

    if (!token) {
      return { isValid: false, isExpired: true, timeUntilExpiry: 0 };
    }

    if (jwtUtils.isTokenExpired(token)) {
      return { isValid: false, isExpired: true, timeUntilExpiry: 0 };
    }

    const expiry = jwtUtils.getTokenExpiry(token);
    if (!expiry) {
      return { isValid: true, isExpired: false, timeUntilExpiry: null };
    }

    const timeUntilExpiry = Math.max(0, expiry - Date.now());
    return { isValid: true, isExpired: false, timeUntilExpiry };
  }
};

// Authenticated request helper
export const authenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const token = authService.getToken();

    if (!token) {
      throw new AuthError('NO_TOKEN', 'No authentication token');
    }

    // Refresh token if needed
    if (authService.shouldRefreshToken()) {
      try {
        await authService.refreshToken();
      } catch (error) {
        throw new AuthError('SESSION_EXPIRED', 'Session expired. Please login again.');
      }
    }

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });

    // Handle 401 with token refresh retry
    if (response.status === 401) {
      try {
        await authService.refreshToken();
        const newToken = authService.getToken();

        if (!newToken) {
          throw new AuthError('NO_TOKEN', 'No token after refresh');
        }

        const retryResponse = await fetch(endpoint, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          },
          credentials: 'include'
        });

        if (!retryResponse.ok) {
          throw new AuthError('REQUEST_FAILED', `Request failed: ${retryResponse.status}`);
        }

        return retryResponse;
      } catch (refreshError) {
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
