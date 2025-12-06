import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { authService } from '../lib/auth';

export const useAuthEnhanced = () => {
  const auth = useAuth();
  const router = useRouter();

  // Enhanced logout with better navigation handling
  const enhancedSignOut = useCallback(async () => {
    try {
      console.log('🚪 Enhanced logout: Starting logout process...');
      await auth.signOut();

      // Clear any additional user-specific data
      if (typeof window !== 'undefined') {
        // Clear any cached data or user preferences
        sessionStorage.clear();

        // Clear specific localStorage items that might persist
        const keysToRemove = [
          'user_preferences',
          'last_visited_page',
          'course_progress',
          'video_watch_history'
        ];

        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
      }

      console.log('✅ Enhanced logout: Logout completed successfully');
    } catch (error) {
      console.error('❌ Enhanced logout: Error during logout:', error);
      // Even if logout fails, ensure user is redirected
      router.push('/');
    }
  }, [auth, router]);

  // Monitor authentication state changes
  useEffect(() => {
    // Check if we should prevent redirect (e.g., during save operations)
    const preventRedirect = typeof window !== 'undefined' && (window as any).__preventAuthRedirect;
    if (preventRedirect) {
      console.log('⏸️ useAuthEnhanced: Redirect prevented due to active operation');
      return;
    }

    if (!auth.user && !auth.loading) {
      console.log('🔍 Auth state changed: User is no longer authenticated');

      // Check if we're on a protected page
      const currentPath = router.pathname;
      const protectedPaths = [
        '/profile',
        '/admin',
        '/favorites',
        '/course/[courseId]/lesson/[lessonId]',
        '/storage-manager'
      ];

      const isOnProtectedPath = protectedPaths.some(path =>
        currentPath === path || currentPath.startsWith(path.replace(/\[.*?\]/g, ''))
      );

      if (isOnProtectedPath) {
        console.log('🚪 Redirecting from protected path:', currentPath);
        router.push('/login');
      }
    }
  }, [auth.user, auth.loading, router]);

  // Token expiration is handled by AuthContext (auto-refresh before expiry)
  // Tokens are only cleared when user manually clicks logout button
  // Removed automatic logout on visibility change to prevent premature logouts

  return {
    ...auth,
    enhancedSignOut,
  };
};
