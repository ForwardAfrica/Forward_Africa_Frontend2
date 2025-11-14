import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { validateTokenInCookie } from '@/lib/validateToken';

export default function CourseIndex() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);

  // Check token on mount - redirect immediately if no valid token in cookie
  useEffect(() => {
    const isTokenValid = validateTokenInCookie();
    if (!isTokenValid) {
      console.log('No valid token, redirecting to login');
      router.replace('/login');
      return;
    }
    setHasCheckedToken(true);
  }, [router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hasCheckedToken && !authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router, hasCheckedToken]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !hasCheckedToken) {
      return;
    }

    const fetchAndRedirect = async () => {
      try {
        // Check if we're already on a specific course route
        // If so, don't redirect automatically
        if (router.asPath.includes('/course/') && !router.asPath.includes('/course/index')) {
          console.log('Already on a specific course route, skipping automatic redirect');
          setIsLoading(false);
          return;
        }

        // Fetch available courses from the API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/courses`);

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const courses = await response.json();

        if (courses && courses.length > 0) {
          // Get the first available course (or you can implement logic to select a specific course)
          const selectedCourse = courses[0];
          console.log('Redirecting to course:', selectedCourse.id);

          // Fetch the specific course to get its lessons
          const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/courses/${selectedCourse.id}`);

          if (courseResponse.ok) {
            const courseData = await courseResponse.json();

            if (courseData.lessons && courseData.lessons.length > 0) {
              // Get the first lesson ID
              const firstLesson = courseData.lessons[0];
              console.log('Redirecting to lesson:', firstLesson.id);

              // Redirect to the selected course's first lesson
              const targetUrl = `/course/${selectedCourse.id}/lesson/${firstLesson.id}`;

              // Prevent navigation if already on the target route
              if (router.asPath === targetUrl) {
                console.log('Already on target lesson, skipping navigation');
                return;
              }

              router.replace(targetUrl);
            } else {
              // No lessons available, redirect to course page
              console.log('No lessons available, redirecting to course page');
              const targetUrl = `/course/${selectedCourse.id}`;

              // Prevent navigation if already on the target route
              if (router.asPath === targetUrl) {
                console.log('Already on course page, skipping navigation');
                return;
              }

              router.replace(targetUrl);
            }
          } else {
            // Course not found, redirect to courses page
            console.log('Course not found, redirecting to courses page');
            router.replace('/courses');
          }
        } else {
          // Fallback if no courses are available
          console.log('No courses available, redirecting to courses page');
          router.replace('/courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to courses page if API fails
        router.replace('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndRedirect();
  }, [router, authLoading, isAuthenticated, hasCheckedToken]);

  // Show loading while fetching and redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">
          {isLoading ? 'Loading available courses...' : 'Redirecting to course...'}
        </p>
      </div>
    </div>
  );
}
