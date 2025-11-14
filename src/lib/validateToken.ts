// Simple token validation - just check if valid token exists in cookie

export const validateTokenInCookie = (): boolean => {
  if (typeof document === 'undefined') return false;

  try {
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('auth_token=')) {
        const value = trimmed.substring('auth_token='.length);
        // If token exists and has content, it's valid
        if (value && value.length > 0) {
          console.log('✅ Valid token found in cookie');
          return true;
        }
      }
    }
    
    console.log('❌ No valid token in cookie');
    return false;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};
