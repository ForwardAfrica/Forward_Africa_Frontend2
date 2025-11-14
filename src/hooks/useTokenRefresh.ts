// Token Refresh Hook
// Provides token refresh functionality and status monitoring

import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../lib/auth';
import { setupAutomaticRefresh, checkTokenStatus } from '../lib/authInterceptor';

export interface TokenStatus {
  isAuthenticated: boolean;
  isExpired: boolean;
  shouldRefresh: boolean;
  expiryTime: number | null;
  timeUntilExpiry: number | null;
}

export interface TokenRefreshState {
  isRefreshing: boolean;
  lastRefreshTime: number | null;
  refreshCount: number;
  error: string | null;
}

export const useTokenRefresh = () => {
  // Initialize with safe defaults to prevent hydration issues
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>(() => {
    // Only check token status on client side
    if (typeof window === 'undefined') {
      return {
        isAuthenticated: false,
        isExpired: true,
        shouldRefresh: false,
        expiryTime: null,
        timeUntilExpiry: null,
      };
    }
    // Explicitly type the return value to match TokenStatus interface
    const status = checkTokenStatus();
    return {
      isAuthenticated: status.isAuthenticated,
      isExpired: status.isExpired,
      shouldRefresh: status.shouldRefresh,
      expiryTime: status.expiryTime,
      timeUntilExpiry: status.timeUntilExpiry,
    };
  });

  const [refreshState, setRefreshState] = useState<TokenRefreshState>({
    isRefreshing: false,
    lastRefreshTime: null,
    refreshCount: 0,
    error: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Update token status
  const updateTokenStatus = useCallback(() => {
    // Only update on client side
    if (typeof window === 'undefined') return;

    const status = checkTokenStatus();
    // Ensure type safety by explicitly mapping the return values
    setTokenStatus({
      isAuthenticated: status.isAuthenticated,
      isExpired: status.isExpired,
      shouldRefresh: status.shouldRefresh,
      expiryTime: status.expiryTime,
      timeUntilExpiry: status.timeUntilExpiry,
    });
  }, []);

  // Manual token refresh
  const refreshToken = useCallback(async (): Promise<boolean> => {
    // Only refresh on client side
    if (typeof window === 'undefined') return false;

    if (refreshState.isRefreshing) {
      console.log('🔄 Token refresh already in progress...');
      return false;
    }

    setRefreshState(prev => ({
      ...prev,
      isRefreshing: true,
      error: null,
    }));

    try {
      console.log('🔄 Manually refreshing token...');
      await authService.refreshToken();

      setRefreshState(prev => ({
        isRefreshing: false,
        lastRefreshTime: Date.now(),
        refreshCount: prev.refreshCount + 1,
        error: null,
      }));

      updateTokenStatus();
      console.log('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      console.error('❌ Token refresh failed:', errorMessage);

      setRefreshState(prev => ({
        ...prev,
        isRefreshing: false,
        error: errorMessage,
      }));

      return false;
    }
  }, [refreshState.isRefreshing, updateTokenStatus]);

  // Force logout
  const forceLogout = useCallback(async () => {
    // Only logout on client side
    if (typeof window === 'undefined') return;

    try {
      await authService.logout();
      setRefreshState({
        isRefreshing: false,
        lastRefreshTime: null,
        refreshCount: 0,
        error: null,
      });
      updateTokenStatus();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [updateTokenStatus]);

  // Setup automatic refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Setup automatic refresh with proper type annotation
    // NOTE: This is now handled by AuthContext, so cleanup might be null
    const cleanup: (() => void) | undefined = setupAutomaticRefresh();
    cleanupRef.current = cleanup || null;

    // Update status on mount and when needed
    // NOTE: Reduced from every 10 seconds to only on mount to avoid excessive state updates
    // AuthContext now handles the periodic token refresh
    updateTokenStatus();

    return () => {
      // Cleanup interval if it was created
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [updateTokenStatus]);

  // Auto-refresh when token is about to expire
  useEffect(() => {
    if (tokenStatus.shouldRefresh && !refreshState.isRefreshing && tokenStatus.isAuthenticated) {
      console.log('🔄 Auto-refreshing token due to expiry...');
      refreshToken();
    }
  }, [tokenStatus.shouldRefresh, refreshState.isRefreshing, tokenStatus.isAuthenticated, refreshToken]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (refreshState.error) {
      const timer = setTimeout(() => {
        setRefreshState(prev => ({ ...prev, error: null }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [refreshState.error]);

  // Get time until expiry in human readable format
  const getTimeUntilExpiry = useCallback(() => {
    if (!tokenStatus.expiryTime) return null;

    const now = Date.now();
    const timeLeft = tokenStatus.expiryTime - now;

    if (timeLeft <= 0) return 'Expired';

    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [tokenStatus.expiryTime]);

  // Check if user should be redirected to login
  const shouldRedirectToLogin = useCallback(() => {
    return !tokenStatus.isAuthenticated && !refreshState.isRefreshing;
  }, [tokenStatus.isAuthenticated, refreshState.isRefreshing]);

  return {
    // Status
    tokenStatus,
    refreshState,

    // Actions
    refreshToken,
    forceLogout,
    updateTokenStatus,

    // Computed values
    timeUntilExpiry: getTimeUntilExpiry(),
    shouldRedirectToLogin: shouldRedirectToLogin(),

    // Utility functions
    isAuthenticated: tokenStatus.isAuthenticated,
    isExpired: tokenStatus.isExpired,
    shouldRefresh: tokenStatus.shouldRefresh,
  };
};

// Hook for components that need to handle token expiration
export const useTokenExpiration = (onExpiration?: () => void) => {
  const { tokenStatus, refreshToken, forceLogout } = useTokenRefresh();

  useEffect(() => {
    if (tokenStatus.isExpired && tokenStatus.isAuthenticated) {
      console.log('⚠️ Token expired, attempting refresh...');

      refreshToken().then((success) => {
        if (!success && onExpiration) {
          console.log('❌ Token refresh failed, calling expiration handler');
          onExpiration();
        }
      });
    }
  }, [tokenStatus.isExpired, tokenStatus.isAuthenticated, refreshToken, onExpiration]);

  return {
    tokenStatus,
    refreshToken,
    forceLogout,
  };
};

// Simplified hook for components that only need token status
export const useTokenStatus = () => {
  const { tokenStatus } = useTokenRefresh();
  return tokenStatus;
};
