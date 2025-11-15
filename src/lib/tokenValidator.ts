// Synchronous token validation without waiting for auth context
// This allows immediate redirects before any component renders
// Uses JWT tokens from cookies - SIMPLE APPROACH: just check if cookie exists

const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;

  try {
    const cookies = document.cookie;
    const cookieArray = cookies.split(';');

    for (const cookie of cookieArray) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('app_user=')) {
        const value = trimmed.substring('app_user='.length);
        if (value) {
          try {
            return decodeURIComponent(value);
          } catch (e) {
            return value;
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error reading cookie:', error);
  }
  return null;
};

export const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    // Simple check: if app_user cookie exists, consider it valid
    // Server will validate the token when making API requests
    const token = getTokenFromCookie();

    if (!token) {
      console.log('❌ No app_user cookie found');
      return false;
    }

    console.log('✅ app_user cookie found, token is present');
    return true;
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    const token = getTokenFromCookie();
    if (!token) return null;

    // Try to parse, but don't fail if parsing doesn't work
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;

      // Simple base64 decode without complex UTF-8 handling
      let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padding = (4 - (base64.length % 4)) % 4;
      if (padding) base64 += '='.repeat(padding);

      if (typeof window !== 'undefined') {
        const decoded = atob(base64);
        const parsed = JSON.parse(decoded);

        return {
          uid: parsed.userId,
          email: parsed.email,
          displayName: parsed.displayName || ''
        };
      }
    } catch (parseError) {
      console.warn('Could not parse token for user data');
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};
