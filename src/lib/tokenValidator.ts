// Synchronous token validation without waiting for auth context
// This allows immediate redirects before any component renders
// Uses JWT tokens from cookies

const parseJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;

    // Prepare base64url string for decoding
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding
    const paddingNeeded = 4 - (base64.length % 4);
    if (paddingNeeded && paddingNeeded !== 4) {
      base64 += '='.repeat(paddingNeeded);
    }

    // Browser-only solution using atob
    if (typeof window !== 'undefined' && window.atob) {
      try {
        const decodedString = atob(base64);
        // Handle UTF-8 properly
        const utf8String = decodeURIComponent(
          Array.from(decodedString)
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(utf8String);
      } catch (e) {
        console.error('Token parse error:', e);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('JWT Parse Error in tokenValidator:', error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) return true;

    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > expiryTime;
  } catch (error) {
    return true;
  }
};

const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('auth_token=')) {
        const value = trimmed.substring('auth_token='.length);
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
    console.error('Error reading cookie:', error);
  }
  return null;
};

export const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const token = getTokenFromCookie();

    if (!token) {
      console.log('🔍 No token found in cookies');
      return false;
    }

    if (isTokenExpired(token)) {
      console.log('⏳ Token is expired');
      return false;
    }

    console.log('✅ Valid token found in cookies');
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

    const payload = parseJWT(token);
    if (!payload || isTokenExpired(token)) return null;

    return {
      uid: payload.userId,
      email: payload.email,
      displayName: payload.displayName || ''
    };
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};
