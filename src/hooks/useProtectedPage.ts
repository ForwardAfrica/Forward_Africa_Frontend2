import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to protect pages that require authentication
 * NOTE: Redirect logic has been moved to AuthContext
 * This hook now just waits for auth to load and logs status
 * Do NOT add redirect logic here - let AuthContext handle it
 */
export const useProtectedPage = () => {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();

  // Just log auth status - don't redirect
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        console.log('✅ User is authenticated, allowing access');
      } else {
        console.log('⏳ Auth context loaded, no user - AuthContext will handle redirect');
      }
    }
  }, [authLoading, user]);
};
