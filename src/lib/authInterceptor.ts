// Auth Interceptor for automatic token refresh
// Handles token refresh and request retry logic

import { authService } from './auth';
import { API_BASE_URL } from './mysql';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  code?: string;
}

export interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  retryCount?: number;
}

class AuthInterceptor {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // Enhanced fetch with automatic token refresh
  async fetch<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { skipAuth = false, retryCount = 0, ...fetchConfig } = config;
    const maxRetries = 2;

    try {
      // Get valid token if authentication is required
      let token: string | null = null;
      if (!skipAuth) {
        try {
          token = await authService.getValidToken();
        } catch (error) {
          // If token refresh fails, redirect to login
          if (retryCount === 0) {
            authService.clearAuthData();
            // Use router for better navigation (if available)
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new Error('Session expired. Please login again.');
          }
          throw error;
        }
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchConfig.headers as Record<string, string>),
      };

      if (token && !skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make the request
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchConfig,
        headers,
      });

      // Handle 401 Unauthorized responses
      if (response.status === 401 && !skipAuth && retryCount < maxRetries) {
        if (this.isRefreshing) {
          // If refresh is already in progress, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry the request with new token
            return this.fetch(endpoint, { ...config, retryCount: retryCount + 1 });
          });
        }

        this.isRefreshing = true;

        try {
          // Attempt to refresh token
          await authService.refreshToken();
          this.processQueue(null, await authService.getValidToken());

          // Retry the original request
          return this.fetch(endpoint, { ...config, retryCount: retryCount + 1 });
        } catch (refreshError) {
          this.processQueue(refreshError, null);

          // Clear auth data and redirect to login
          authService.clearAuthData();
          // Use router for better navigation (if available)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please login again.');
        } finally {
          this.isRefreshing = false;
        }
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse response
      const data = await response.json();
      return { data };

    } catch (error) {
      console.error('API request failed:', error);

      // If this is a retry and it failed, don't retry again
      if (retryCount >= maxRetries) {
        throw error;
      }

      // For network errors, retry once
      if (error instanceof TypeError && retryCount < maxRetries) {
        console.log(`Retrying request (${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.fetch(endpoint, { ...config, retryCount: retryCount + 1 });
      }

      throw error;
    }
  }

  // GET request
  async get<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { ...config, method: 'GET' });
  }

  // POST request
  async post<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // PATCH request
  async patch<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Upload file with progress tracking
  async upload<T = any>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.fetch<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...config.headers,
      },
    });
  }

  // Download file
  async download(endpoint: string, filename?: string, config: RequestConfig = {}): Promise<void> {
    const response = await this.fetch(endpoint, {
      ...config,
      method: 'GET',
      headers: {
        ...config.headers,
        'Accept': 'application/octet-stream',
      },
    });

    if (response.data) {
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }
}

// Create singleton instance
export const apiClient = new AuthInterceptor();
export const authInterceptor = apiClient; // Alias for backward compatibility

// Export individual methods for convenience
export const {
  get,
  post,
  put,
  delete: del,
  patch,
  upload,
  download,
} = apiClient;

// Enhanced authenticated request helper
export const authenticatedRequest = async <T = any>(
  endpoint: string,
  options: RequestConfig = {}
): Promise<T> => {
  const response = await apiClient.fetch<T>(endpoint, options);
  return response.data as T;
};

// Token refresh status checker
export const checkTokenStatus = (): {
  isAuthenticated: boolean;
  isExpired: boolean;
  shouldRefresh: boolean;
  expiryTime: number | null;
  timeUntilExpiry: number | null;
} => {
  const expiryTime = authService.getTokenExpiry();
  const timeUntilExpiry = expiryTime ? expiryTime - Date.now() : null;

  return {
    isAuthenticated: authService.isAuthenticated(),
    isExpired: authService.isTokenExpired(),
    shouldRefresh: authService.shouldRefreshToken(),
    expiryTime: expiryTime,
    timeUntilExpiry: timeUntilExpiry,
  };
};

// Setup automatic token refresh
export const setupAutomaticRefresh = (): (() => void) | undefined => {
  if (typeof window === 'undefined') return undefined;

  // NOTE: Automatic token refresh is now handled by AuthContext
  // Disabling this to prevent conflicts with the new consolidated auth system
  // Check token status every 30 seconds (DISABLED - handled by AuthContext instead)
  // const interval = setInterval(async () => {
  //   try {
  //     if (authService.isAuthenticated() && authService.shouldRefreshToken()) {
  //       console.log('🔄 Automatic token refresh triggered...');
  //       await authService.refreshToken();
  //       console.log('✅ Token refreshed automatically');
  //     }
  //   } catch (error) {
  //     console.error('❌ Automatic token refresh failed:', error);
  //     // Don't clear auth data immediately, let the user continue
  //   }
  // }, 30 * 1000);

  // Cleanup on page unload
  const cleanup = () => {
    // clearInterval(interval); - disabled
  };

  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);

  return cleanup;
};
