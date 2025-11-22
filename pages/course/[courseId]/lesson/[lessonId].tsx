import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Play, Clock, ChevronLeft, ChevronRight, BookOpen, CheckCircle } from 'lucide-react';
import VideoPlayer from '../../../../src/components/ui/VideoPlayer';
import { Course, Lesson } from '../../../../src/types';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { validateTokenInCookie } from '../../../../src/lib/validateToken';
import { courseAPI } from '../../../../src/lib/api';

// Debug utility
const DEBUG = {
  log: (message: string, data?: any) => {
    console.log(`🐛 [DEBUG] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`❌ [DEBUG ERROR] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [DEBUG WARN] ${message}`, data || '');
  }
};


export default function LessonPage() {
  const router = useRouter();
  const { courseId, lessonId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [showInstructorBio, setShowInstructorBio] = useState(false);
  const lastFetchedKey = useRef<string>('');

  // Debug: Log component mount and initial state
  useEffect(() => {
    DEBUG.log('🚀 LessonPage Component Mounted', {
      courseId,
      lessonId,
      router: {
        isReady: router.isReady,
        pathname: router.pathname,
        asPath: router.asPath,
        query: router.query
      },
      auth: {
        user: user ? { id: user.id, email: user.email } : null,
        authLoading
      }
    });
  }, []);

  // Debug: Log route changes
  useEffect(() => {
    if (router.isReady) {
      DEBUG.log('🔄 Route Changed', {
        courseId,
        lessonId,
        isReady: router.isReady,
        pathname: router.pathname,
        asPath: router.asPath
      });
    }
  }, [router.isReady, courseId, lessonId, router.pathname, router.asPath]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Check token in cookie first
  useEffect(() => {
    const isTokenValid = validateTokenInCookie();
    if (!isTokenValid) {
      DEBUG.warn('⚠️ No valid token in cookie, redirecting to login');
      router.replace('/login');
      return;
    }
  }, [router]);

  // Authentication check - improved to prevent navigation loops
  useEffect(() => {
    DEBUG.log('🔐 Authentication Check', {
      authLoading,
      user: user ? {
        id: user.id,
        email: user.email,
        onboarding_completed: user.onboarding_completed
      } : null,
      courseId,
      lessonId
    });

    // Only redirect if we're sure the user is not authenticated and auth check is complete
    if (!authLoading && !user && router.isReady) {
      DEBUG.warn('⚠️ User not authenticated, redirecting to login');
      // Use replace to prevent back button issues
      router.replace('/login');
      return;
    }

    // Allow access even if onboarding is incomplete (progressive profiling)
    if (!authLoading && user && !user.onboarding_completed) {
      DEBUG.warn('⚠️ User has not completed onboarding, but allowing access to course content');
    }
  }, [user, authLoading, router.isReady, courseId, lessonId]);

  // Fetch course data with detailed debugging
    useEffect(() => {
    if (!router.isReady || !courseId) {
      DEBUG.log('⏳ Waiting for router to be ready or courseId', {
        isReady: router.isReady,
        courseId
      });
      return;
    }

    const fetchKey = `${courseId}-${lessonId}`;
    if (lastFetchedKey.current === fetchKey) {
      DEBUG.log('🔄 Skipping fetch - same key already fetched', { fetchKey });
      return;
    }

        const fetchCourseData = async () => {
        try {
          setLoading(true);
        setError(null);
        DEBUG.log('📡 Starting course data fetch', {
          courseId,
          lessonId
        });

          // Fetch course from database API using authenticated request
          let courseResponse;
          try {
            courseResponse = await courseAPI.getCourse(courseId as string);
          } catch (error) {
            console.error('API Request error:', error);
            throw new Error('Failed to fetch course data. Please check your connection and try again.');
          }

        // Handle wrapped response from API
        const foundCourse = courseResponse.data || courseResponse;

        if (!foundCourse || !foundCourse.id) {
          throw new Error('Course data is invalid or missing');
        }

        DEBUG.log('📡 API Response received', {
          courseId: foundCourse.id,
          title: foundCourse.title
        });
        DEBUG.log('📦 Course data received', {
          courseId: foundCourse.id,
          title: foundCourse.title,
          lessonsCount: foundCourse.lessons?.length || 0,
          lessons: foundCourse.lessons?.map((l: any) => ({
            id: l.id,
            title: l.title,
            course_id: l.course_id,
            duration: l.duration,
            video_url: l.video_url
          })) || [],
          instructor: {
            name: foundCourse.instructor_name,
            title: foundCourse.instructor_title,
            email: foundCourse.instructor_email,
            phone: foundCourse.instructor_phone,
            experience: foundCourse.instructor_experience,
            bio: foundCourse.instructor_bio,
            social_links: foundCourse.instructor_social_links
          }
        });

        // Check if this course is coming soon - redirect if so
        if (foundCourse.coming_soon) {
          DEBUG.log('⚠️ Course is marked as coming soon, redirecting to courses page');
          router.push('/courses');
          return;
        }

        // Transform instructor data with dual fallback logic (same as CoursePage)
        const instructorInfo = (() => {
          let instructorName = 'Unknown Instructor';
          let instructorTitle = 'Expert Educator';
          let instructorImage = '/images/placeholder-avatar.jpg';
          let instructorBio = 'No biography available.';
          let instructorEmail = 'instructor@forwardafrica.com';
          let instructorPhone = '';
          let instructorExperience = 5;
          let instructorSocialLinks = {};

          DEBUG.log('🔍 Instructor transformation debug:', {
            hasInstructorObject: !!foundCourse.instructor,
            instructorType: typeof foundCourse.instructor,
            hasInstructorName: !!foundCourse.instructor_name,
            instructorNameValue: foundCourse.instructor_name,
            instructorTitleValue: foundCourse.instructor_title,
            instructorImageValue: foundCourse.instructor_image,
            instructorBioValue: foundCourse.instructor_bio,
            instructorEmailValue: foundCourse.instructor_email,
            instructorPhoneValue: foundCourse.instructor_phone,
            instructorExperienceValue: foundCourse.instructor_experience,
            instructorSocialLinksValue: foundCourse.instructor_social_links
          });

          try {
            // First: Try to access the transformed instructor object (from useCourses hook)
            if (foundCourse.instructor && typeof foundCourse.instructor === 'object' && foundCourse.instructor !== null) {
              DEBUG.log('✅ Using instructor object');
              instructorName = (foundCourse.instructor as any).name || 'Unknown Instructor';
              instructorTitle = (foundCourse.instructor as any).title || 'Expert Educator';
              instructorImage = (foundCourse.instructor as any).image || '/images/placeholder-avatar.jpg';
              instructorBio = (foundCourse.instructor as any).bio || 'No biography available.';
              instructorEmail = (foundCourse.instructor as any).email || 'instructor@forwardafrica.com';
              instructorPhone = (foundCourse.instructor as any).phone || '';
              instructorExperience = (foundCourse.instructor as any).experience || 5;
              instructorSocialLinks = (foundCourse.instructor as any).social_links || {};
            }
            // Second: Fall back to raw API field (direct from API)
            else if (foundCourse.instructor_name) {
              DEBUG.log('✅ Using instructor_name field');
              instructorName = foundCourse.instructor_name || 'Unknown Instructor';
              instructorTitle = foundCourse.instructor_title || 'Expert Educator';
              instructorImage = foundCourse.instructor_image || '/images/placeholder-avatar.jpg';
              instructorBio = foundCourse.instructor_bio || 'No biography available.';
              instructorEmail = foundCourse.instructor_email || 'instructor@forwardafrica.com';
              instructorPhone = foundCourse.instructor_phone || '';
              instructorExperience = foundCourse.instructor_experience || 5;
                            try {
                if (foundCourse.instructor_social_links) {
                  if (typeof foundCourse.instructor_social_links === 'string') {
                    // If it's a string, try to parse it
                    if (foundCourse.instructor_social_links === '[object Object]') {
                      // Handle the MySQL JSON object issue
                      instructorSocialLinks = {};
                    } else {
                      instructorSocialLinks = JSON.parse(foundCourse.instructor_social_links);
                    }
                  } else if (typeof foundCourse.instructor_social_links === 'object') {
                    // If it's already an object, use it directly
                    instructorSocialLinks = foundCourse.instructor_social_links;
                  } else {
                    instructorSocialLinks = {};
                  }
                } else {
                  instructorSocialLinks = {};
                }
              } catch (error) {
                DEBUG.error('Error parsing social links:', error);
                instructorSocialLinks = {};
              }
            }
            // Third: Handle string instructor (legacy format)
            else if (typeof foundCourse.instructor === 'string') {
              DEBUG.log('✅ Using string instructor');
              instructorName = foundCourse.instructor;
              instructorTitle = 'Expert Educator';
              instructorImage = '/images/placeholder-avatar.jpg';
              instructorBio = 'No biography available.';
              instructorEmail = 'instructor@forwardafrica.com';
              instructorPhone = '';
              instructorExperience = 5;
              instructorSocialLinks = {};
            }
            // Fourth: Final fallback
            else {
              DEBUG.log('❌ Using final fallback - no instructor data found');
              instructorName = 'Unknown Instructor';
              instructorTitle = 'Expert Educator';
              instructorImage = '/images/placeholder-avatar.jpg';
              instructorBio = 'No biography available.';
              instructorEmail = 'instructor@forwardafrica.com';
              instructorPhone = '';
              instructorExperience = 5;
              instructorSocialLinks = {};
            }
          } catch (error) {
            DEBUG.error('Error accessing instructor data:', error);
            instructorName = 'Unknown Instructor';
            instructorTitle = 'Expert Educator';
            instructorImage = '/images/placeholder-avatar.jpg';
            instructorBio = 'No biography available.';
            instructorEmail = 'instructor@forwardafrica.com';
            instructorPhone = '';
            instructorExperience = 5;
            instructorSocialLinks = {};
          }

          return {
            id: foundCourse.instructor_id || `instructor-${foundCourse.id}`,
            name: instructorName,
            title: instructorTitle,
            image: instructorImage,
            bio: instructorBio,
            email: instructorEmail,
            phone: instructorPhone,
            experience: instructorExperience,
            socialLinks: instructorSocialLinks,
            expertise: foundCourse.instructor_expertise ? foundCourse.instructor_expertise.split(',').map((exp: string) => exp.trim()) : ['General Education'],
            createdAt: new Date(foundCourse.created_at || Date.now())
          };
        })();

        // Transform course data and lessons to match frontend format
        const transformedCourse: Course = {
          id: foundCourse.id,
          title: foundCourse.title,
          description: foundCourse.description,
          instructor: instructorInfo,
          thumbnail: foundCourse.thumbnail,
          lessons: (foundCourse.lessons || []).map((lesson: any) => ({
            ...lesson,
            // Transform snake_case to camelCase for video URL
            videoUrl: lesson.video_url || lesson.videoUrl,
            // Ensure other fields are properly formatted
            id: lesson.id,
            title: lesson.title,
            description: lesson.description || '',
            duration: lesson.duration || '0:00',
            course_id: lesson.course_id,
            order: lesson.order || 0,
            thumbnail: lesson.thumbnail || lesson.lesson_thumbnail || '/images/placeholder-course.jpg'
          })),
          category: foundCourse.category,
          banner: foundCourse.banner || foundCourse.thumbnail,
          videoUrl: foundCourse.videoUrl,
          featured: foundCourse.featured || false,
          totalXP: foundCourse.totalXP || 1000,
          comingSoon: foundCourse.comingSoon || false,
          releaseDate: foundCourse.releaseDate
        };

        DEBUG.log('🔄 Course data transformed', {
          transformedCourse: {
            id: transformedCourse.id,
            title: transformedCourse.title,
            lessonsCount: transformedCourse.lessons.length,
            lessonIds: transformedCourse.lessons.map((l: any) => l.id),
            lessonDetails: transformedCourse.lessons.map((l: any) => ({
              id: l.id,
              title: l.title,
              course_id: l.course_id
            }))
          }
        });

        setCourse(transformedCourse);
        lastFetchedKey.current = fetchKey;

        // Find the target lesson
        const currentLesson = transformedCourse.lessons.find(lesson => {
          // Handle both string and number types for lesson ID comparison
          const lessonIdStr = String(lesson.id);
          const requestedLessonIdStr = String(lessonId);
          const matches = lessonIdStr === requestedLessonIdStr;

          DEBUG.log('🔍 Lesson ID comparison', {
            lessonId: lesson.id,
            lessonIdType: typeof lesson.id,
            requestedLessonId: lessonId,
            requestedLessonIdType: typeof lessonId,
            lessonIdStr,
            requestedLessonIdStr,
            matches
          });

          return matches;
        });

          if (currentLesson) {
            setCurrentLesson(currentLesson);
            setCourse(transformedCourse);

            // Calculate progress
            const lessonIndex = transformedCourse.lessons.findIndex(l => l.id === lessonId);
            setCurrentLessonIndex(lessonIndex);
            const progressValue = ((lessonIndex + 1) / transformedCourse.lessons.length) * 100;
            setProgress(progressValue);
            DEBUG.log('📊 Progress calculated', { progressValue, lessonIndex, totalLessons: transformedCourse.lessons.length });

          } else {
            DEBUG.error('❌ Lesson not found', {
              targetLessonId: lessonId,
              availableLessonIds: transformedCourse.lessons.map(l => l.id),
              availableLessons: transformedCourse.lessons.map(l => ({ id: l.id, title: l.title }))
            });

            // Try to redirect to the first available lesson instead of course page
            if (transformedCourse.lessons.length > 0) {
              const firstLesson = transformedCourse.lessons[0];
              const fallbackUrl = `/course/${courseId}/lesson/${firstLesson.id}`;

              // Prevent redirecting to the same lesson that's not found
              if (firstLesson.id === lessonId) {
                DEBUG.error('❌ First lesson is the same as requested lesson, redirecting to course page');
                router.push(`/course/${courseId}`);
                return;
              }

              DEBUG.log('🔄 Redirecting to first available lesson', {
                fallbackUrl,
                firstLessonId: firstLesson.id,
                firstLessonTitle: firstLesson.title,
                requestedLessonId: lessonId,
                availableLessonIds: transformedCourse.lessons.map(l => l.id)
              });

              router.replace(fallbackUrl);
              return;
            } else {
              // No lessons available, redirect to course page
              router.push(`/course/${courseId}`);
              return;
            }
          }

        setLoading(false);
        DEBUG.log('✅ Course data fetch completed successfully');

        } catch (error) {
        DEBUG.error('❌ Error fetching course data', error);
        setError(error instanceof Error ? error.message : 'Failed to load course data');
          setLoading(false);
        }
      };

      fetchCourseData();
  }, [courseId, lessonId, router.isReady]);

  // Debug: Log state changes
  useEffect(() => {
    DEBUG.log('📊 State Updated', {
      loading,
      course: course ? { id: course.id, title: course.title, lessonsCount: course.lessons.length } : null,
      currentLesson: currentLesson ? { id: currentLesson.id, title: currentLesson.title } : null,
      currentLessonIndex,
      progress,
      error
    });
  }, [loading, course, currentLesson, currentLessonIndex, progress, error]);

  // Navigation functions with debugging
  const navigateToLesson = (direction: 'prev' | 'next') => {
    if (!course) return;

    const newIndex = direction === 'next' ? currentLessonIndex + 1 : currentLessonIndex - 1;

    DEBUG.log('🔄 Navigating to lesson', {
      direction,
      currentIndex: currentLessonIndex,
      newIndex,
      totalLessons: course.lessons.length,
      isValid: newIndex >= 0 && newIndex < course.lessons.length
    });

    if (newIndex >= 0 && newIndex < course.lessons.length) {
      const targetLesson = course.lessons[newIndex];
      const targetUrl = `/course/${courseId}/lesson/${targetLesson.id}`;

      // Prevent navigation if already on the target route
      if (router.asPath === targetUrl) {
        DEBUG.log('Already on target lesson, skipping navigation');
        return;
      }

      DEBUG.log('🎯 Target lesson', {
        id: targetLesson.id,
        title: targetLesson.title,
        targetUrl
      });

      router.replace(targetUrl);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    DEBUG.log('⏳ Showing auth loading state');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching course data
  if (loading || !course || !currentLesson) {
    DEBUG.log('⏳ Showing data loading state', {
      loading,
      hasCourse: !!course,
      hasCurrentLesson: !!currentLesson
    });

    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-400">
            {error ? `Error: ${error}` : 'Loading course data...'}
          </p>
          {debugInfo && Object.keys(debugInfo).length > 0 && (
            <div className="mt-4 text-xs text-gray-500 max-w-md mx-auto">
              <p>Debug Info:</p>
              <pre className="text-left overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Debug: Log successful render
  DEBUG.log('🎉 Rendering lesson page successfully', {
    course: { id: course.id, title: course.title },
    lesson: { id: currentLesson.id, title: currentLesson.title },
    progress
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Debug Panel - Only show on client side */}
      {typeof window !== 'undefined' && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-80 p-4 rounded-lg text-xs max-w-sm z-50">
          <h3 className="font-bold mb-2">🐛 Debug Info</h3>
          <div className="space-y-1">
            <div>Course: {course?.title}</div>
            <div>Lesson: {currentLesson?.title}</div>
            <div>Progress: {progress.toFixed(1)}%</div>
            <div>Auth: {user ? 'Logged in' : 'Not logged in'}</div>
            <div>Error: {error || 'None'}</div>
            <button
              onClick={clearLocalStorage}
              className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Local Storage</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // Navigate directly to the specific course page
                  // Use replace to prevent back button issues
                  router.replace(`/course/${courseId}`);
                }}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Course</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  Lesson {currentLessonIndex + 1} of {course.lessons.length}
                </span>
                </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {currentLesson.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
          <div className="lg:col-span-2">
                         <div className="bg-black rounded-lg overflow-hidden">
               <VideoPlayer
                 lesson={currentLesson}
                 courseId={courseId as string}
                 showProgressPanel={true}
               />
            </div>

            {/* Instructor Details */}
            <div className="mt-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={course.instructor?.image || '/images/placeholder-avatar.jpg'}
                    alt={course.instructor?.name || 'Instructor'}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/images/placeholder-avatar.jpg') {
                        target.src = '/images/placeholder-avatar.jpg';
                      }
                    }}
                  />
                  <div>
                    <h3 className="text-white font-medium text-lg">{course.instructor?.name || 'Instructor'}</h3>
                    <p className="text-gray-400 text-sm">{course.instructor?.title || 'Expert Educator'}</p>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 w-24">Professional Title:</span>
                      <span className="text-white">{course.instructor?.title || 'Expert Educator'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 w-24">Email Address:</span>
                      <span className="text-white">{course.instructor?.email || 'instructor@forwardafrica.com'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 w-24">Phone Number:</span>
                      <span className="text-white">{course.instructor?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 w-24">Experience:</span>
                      <span className="text-white">{course.instructor?.experience || 5} years</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 w-24">LinkedIn:</span>
                      {course.instructor?.socialLinks?.linkedin ? (
                        <a
                          href={course.instructor.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View Profile
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 w-24">Twitter:</span>
                      {course.instructor?.socialLinks?.twitter ? (
                        <a
                          href={course.instructor.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          @{course.instructor.socialLinks.twitter.split('/').pop()}
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 w-24">Website:</span>
                      {course.instructor?.socialLinks?.website ? (
                        <a
                          href={course.instructor.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Visit Website
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Biography */}
                {course.instructor?.bio && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Professional Biography</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {course.instructor.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Info */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-white mb-4">
                {currentLesson.title}
              </h1>
              <p className="text-gray-300 mb-6">
                {currentLesson.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Progress */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Course Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Lesson Navigation */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Lesson Navigation</h3>
              <div className="flex justify-between mb-4">
                <button
                  onClick={() => navigateToLesson('prev')}
                  disabled={currentLessonIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => navigateToLesson('next')}
                  disabled={currentLessonIndex === course.lessons.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Lesson List */}
                <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                    onClick={() => {
                      const targetUrl = `/course/${courseId}/lesson/${lesson.id}`;

                      // Prevent navigation if already on the target route
                      if (router.asPath === targetUrl) {
                        DEBUG.log('Already on target lesson, skipping navigation');
                        return;
                      }

                      DEBUG.log('🔄 Navigating to lesson from list', {
                        lessonId: lesson.id,
                        lessonTitle: lesson.title,
                        index,
                        targetUrl
                      });
                      router.replace(targetUrl);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                        lesson.id === currentLesson.id
                          ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {index < currentLessonIndex ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : index === currentLessonIndex ? (
                          <Play className="h-4 w-4 text-red-400" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-500" />
                        )}
                        <span className="text-sm font-medium">
                          Lesson {index + 1}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {lesson.duration}
                      </span>
                    </div>
                    <p className="text-xs mt-1 truncate">
                          {lesson.title}
                        </p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
