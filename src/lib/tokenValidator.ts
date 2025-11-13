// Synchronous token validation without waiting for auth context
// This allows immediate redirects before any component renders
// Uses JWT tokens from cookies

const parseJWT = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    // Decode base64 with URL-safe padding
    let decoded = payload.replace(/-/g, '+').replace(/_/g, '/');
    decoded += new Array(5 - (decoded.length % 4)).join('=');

    // Use atob for browser compatibility
    if (typeof window !== 'undefined' && window.atob) {
      return JSON.parse(window.atob(decoded));
    } else if (typeof Buffer !== 'undefined') {
      return JSON.parse(Buffer.from(decoded, 'base64').toString('utf8'));
    }

    return null;
  } catch (error) {
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
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' && value) {
        return decodeURIComponent(value);
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
