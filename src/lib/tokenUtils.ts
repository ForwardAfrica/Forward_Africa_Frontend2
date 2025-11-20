/**
 * Utility functions for managing JWT tokens stored in localStorage
 */

const TOKEN_KEY = 'forward_africa_token';
const REFRESH_TOKEN_KEY = 'forward_africa_refresh_token';

export const tokenUtils = {
  /**
   * Get the current JWT access token from localStorage
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get the refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set the access token in localStorage
   */
  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Set the refresh token in localStorage
   */
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Clear all tokens from localStorage
   */
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Check if a token exists
   */
  hasToken: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
