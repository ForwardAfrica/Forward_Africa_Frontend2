// Synchronous token validation without waiting for auth context
// This allows immediate redirects before any component renders

import { auth } from './firebase';

export const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    // Check Firebase auth synchronously - auth.currentUser is available immediately
    const currentUser = auth.currentUser;
    return !!currentUser;
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    return auth.currentUser;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};
