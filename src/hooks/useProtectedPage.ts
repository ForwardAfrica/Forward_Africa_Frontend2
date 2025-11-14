import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { validateTokenInCookie } from '../lib/validateToken';

/**
 * Hook to protect pages that require authentication
 * Redirects to login if no valid token is found in cookie
 * Waits for auth context to load before making final decision
 */
export const useProtectedPage = () => {
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't redirect multiple times
    if (hasRedirected.current) return;

    // If auth context is still loading, wait
    if (authLoading) {
      console.log('⏳ Auth context loading, waiting...');
      return;
    }

    // Check token in cookie
    const isTokenValid = validateTokenInCookie();

    // If no token and auth finished loading, redirect to login
    if (!isTokenValid && !user) {
      console.log('❌ No valid token and no user, redirecting to login');
      hasRedirected.current = true;
      router.replace('/login');
    } else if (isTokenValid || user) {
      console.log('✅ User is authenticated, allowing access');
    }
  }, [authLoading, user, router]);
};
