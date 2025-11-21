import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Play, ChevronDown, ChevronUp, Clock, Award, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import VideoPlayer from '../components/ui/VideoPlayer';
import Layout from '../components/layout/Layout';
import { Course, UserProgress, Certificate } from '../types';
import { useCertificates } from '../hooks/useCertificates';
import { useAuth } from '../contexts/AuthContext';
import { downloadCertificate } from '../utils/certificateGenerator';
import Image from 'next/image';
import CourseProgressDashboard from '../components/ui/CourseProgressDashboard';
import { courseAPI } from '../lib/api';

const CoursePage: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const { generateCertificate, getCertificate } = useCertificates();
  const [certificate, setCertificate] = useState<Certificate | undefined>(undefined);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [courseCompletionStatus, setCourseCompletionStatus] = useState<{
    isCompleted: boolean;
    completedLessons: string[];
    totalLessons: number;
    completionPercentage: number;
  }>({
    isCompleted: false,
    completedLessons: [],
    totalLessons: 0,
    completionPercentage: 0
  });
  const [showCompletionNotification, setShowCompletionNotification] = useState(false);

  // Set client flag on mount to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
    setHasCheckedToken(true);
  }, []);

  // NOTE: Removed manual token redirect checks
  // AuthContext now handles all authentication redirects
  // No need to check token here - ProtectedRoute or AuthContext will handle it

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (courseId && isClient) {
      const cert = getCertificate(courseId as string);
      setCertificate(cert);
    }
  }, [courseId, getCertificate, isClient]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !hasCheckedToken) {
      return;
    }

    const fetchCourseData = async () => {
      if (courseId && typeof courseId === 'string') {
        try {
          setLoading(true);
          console.log('Fetching course data for:', courseId);

          // Fetch course from database API using the authenticated API request
          let courseResponse;
          try {
            courseResponse = await courseAPI.getCourse(courseId);
          } catch (error) {
            console.error('API Request error:', error);
            throw new Error('Failed to fetch course data. Please check your connection and try again.');
          }

          // Handle wrapped response from API
          const foundCourse = courseResponse.data || courseResponse;

          if (!foundCourse || !foundCourse.id) {
            throw new Error('Course data is invalid or missing');
          }

          console.log('Course data from API:', foundCourse);
          console.log('Instructor data from API:', {
            instructor_name: foundCourse.instructor_name,
            instructor_title: foundCourse.instructor_title,
            instructor_image: foundCourse.instructor_image,
            instructor_id: foundCourse.instructor_id
          });
          console.log('Raw lessons from API:', foundCourse.lessons);

          // Check if this course is coming soon - redirect if so
          if (foundCourse.coming_soon) {
            console.log('⚠️ Course is marked as coming soon, redirecting to courses page');
            router.push('/courses');
            return;
          }

          // Check if this course has no lessons but there might be another course with the same title
          if (!foundCourse.lessons || foundCourse.lessons.length === 0) {
            console.log('⚠️ Course has no lessons, checking for alternative course with same title');
            console.log('🔍 Current course:', {
              id: foundCourse.id,
              title: foundCourse.title,
              lessonsCount: foundCourse.lessons?.length || 0
            });

            // Fetch all courses to find alternative
            try {
              const allCoursesResponse = await courseAPI.getAllCourses(true);
              const allCoursesData = Array.isArray(allCoursesResponse) ? allCoursesResponse : allCoursesResponse.data || allCoursesResponse.courses || [];

              // Find courses with the same title that have lessons
              const alternativeCourses = allCoursesData.filter((course: any) =>
                course.title === foundCourse.title &&
                course.id !== foundCourse.id &&
                course.lessons &&
                course.lessons.length > 0
              );

              console.log('🔍 Alternative courses found:', alternativeCourses.map((c: any) => ({
                id: c.id,
                title: c.title,
                lessonsCount: c.lessons?.length || 0
              })));

              if (alternativeCourses.length > 0) {
                const bestAlternative = alternativeCourses[0]; // Take the first one
                console.log('🎯 Found alternative course with lessons:', {
                  currentCourseId: foundCourse.id,
                  alternativeCourseId: bestAlternative.id,
                  alternativeLessonsCount: bestAlternative.lessons.length,
                  alternativeFirstLesson: bestAlternative.lessons[0]
                });

                // Redirect to the alternative course
                const targetUrl = `/course/${bestAlternative.id}`;
                console.log('🔄 Redirecting to alternative course:', targetUrl);
                router.replace(targetUrl);
                return;
              } else {
                console.log('❌ No alternative courses found with lessons');
              }
            } catch (error) {
              console.error('Error fetching alternative courses:', error);
            }
          }

          // Transform the course data to match frontend format with dual fallback logic
          const transformedCourse = {
            id: foundCourse.id,
            title: foundCourse.title,
            instructor: (() => {
              // DUAL FALLBACK instructor handling - same logic as admin page
              let instructorName = 'Unknown Instructor';
              let instructorTitle = 'Instructor';
              let instructorImage = '/images/placeholder-avatar.jpg';
              let instructorBio = 'Experienced instructor';
              let instructorEmail = 'instructor@forwardafrica.com';

              console.log('🔍 Instructor transformation debug:', {
                hasInstructorObject: !!foundCourse.instructor,
                instructorType: typeof foundCourse.instructor,
                hasInstructorName: !!foundCourse.instructor_name,
                instructorNameValue: foundCourse.instructor_name,
                instructorTitleValue: foundCourse.instructor_title,
                instructorImageValue: foundCourse.instructor_image
              });

              try {
                // First: Try to access the transformed instructor object (from useCourses hook)
                if (foundCourse.instructor && typeof foundCourse.instructor === 'object' && foundCourse.instructor !== null) {
                  console.log('✅ Using instructor object');
                  instructorName = (foundCourse.instructor as any).name || 'Unknown Instructor';
                  instructorTitle = (foundCourse.instructor as any).title || 'Instructor';
                  instructorImage = (foundCourse.instructor as any).image || '/images/placeholder-avatar.jpg';
                  instructorBio = (foundCourse.instructor as any).bio || 'Experienced instructor';
                  instructorEmail = (foundCourse.instructor as any).email || 'instructor@forwardafrica.com';
                }
                // Second: Fall back to raw API field (direct from API)
                else if (foundCourse.instructor_name) {
                  console.log('✅ Using instructor_name field');
                  instructorName = foundCourse.instructor_name || 'Unknown Instructor';
                  instructorTitle = foundCourse.instructor_title || 'Instructor';
                  instructorImage = foundCourse.instructor_image || '/images/placeholder-avatar.jpg';
                  instructorBio = foundCourse.instructor_bio || 'Experienced instructor';
                  instructorEmail = foundCourse.instructor_email || 'instructor@forwardafrica.com';
                }
                // Third: Handle string instructor (legacy format)
                else if (typeof foundCourse.instructor === 'string') {
                  console.log('✅ Using string instructor');
                  instructorName = foundCourse.instructor;
                  instructorTitle = 'Instructor';
                  instructorImage = '/images/placeholder-avatar.jpg';
                  instructorBio = 'Experienced instructor';
                  instructorEmail = 'instructor@forwardafrica.com';
                }
                // Fourth: Final fallback
                else {
                  console.log('❌ Using final fallback - no instructor data found');
                  instructorName = 'Unknown Instructor';
                  instructorTitle = 'Instructor';
                  instructorImage = '/images/placeholder-avatar.jpg';
                  instructorBio = 'Experienced instructor';
                  instructorEmail = 'instructor@forwardafrica.com';
                }
              } catch (error) {
                console.error('Error accessing instructor data:', error);
                instructorName = 'Unknown Instructor';
                instructorTitle = 'Instructor';
                instructorImage = '/images/placeholder-avatar.jpg';
                instructorBio = 'Experienced instructor';
                instructorEmail = 'instructor@forwardafrica.com';
              }

              console.log('🎯 Final instructor data:', {
                name: instructorName,
                title: instructorTitle,
                image: instructorImage
              });

              return {
                id: foundCourse.instructor_id || 'unknown',
                name: instructorName,
                title: instructorTitle,
                image: instructorImage,
                bio: instructorBio,
                email: instructorEmail,
                expertise: ['Education'],
                experience: 5,
                createdAt: new Date()
              };
            })(),
            instructorId: foundCourse.instructor_id,
            category: foundCourse.category_name || 'General',
            thumbnail: foundCourse.thumbnail || '/images/placeholder-course.jpg',
            banner: foundCourse.banner || '/images/placeholder-course.jpg',
            videoUrl: foundCourse.video_url,
            description: foundCourse.description || 'Course description coming soon.',
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
            featured: foundCourse.featured || false,
            totalXP: foundCourse.total_xp || 1000,
            comingSoon: foundCourse.coming_soon === 1 || foundCourse.coming_soon === true,
            releaseDate: foundCourse.release_date
          };

          console.log('Transformed course data:', transformedCourse);
          console.log('Transformed lessons:', transformedCourse.lessons);
          console.log('Lesson IDs:', transformedCourse.lessons.map((l: any) => l.id));

          setCourse(transformedCourse);

          // Load progress from localStorage for courses without lessons (only on client side)
          if (typeof window !== 'undefined') {
            const storedProgress = localStorage.getItem('userProgress');
            if (storedProgress) {
              const progressData = JSON.parse(storedProgress);
              if (progressData[courseId]) {
                setSelectedLesson(progressData[courseId].lessonId);
                setProgress(progressData[courseId].progress);
              } else {
                setSelectedLesson(null);
              }
            } else {
              setSelectedLesson(null);
              setProgress(0);
            }
          } else {
            setSelectedLesson(null);
            setProgress(0);
          }

          // Load completion data from localStorage
          useEffect(() => {
            if (courseId && typeof window !== 'undefined') {
              const storedCompletion = localStorage.getItem(`courseCompletion_${courseId}`);
              if (storedCompletion) {
                try {
                  const completionData = JSON.parse(storedCompletion);
                  setCompletedLessons(completionData.completedLessons || []);
                  setCourseCompletionStatus({
                    isCompleted: completionData.isCompleted || false,
                    completedLessons: completionData.completedLessons || [],
                    totalLessons: course?.lessons.length || 0,
                    completionPercentage: completionData.completionPercentage || 0
                  });
                } catch (error) {
                  console.error('Error parsing completion data:', error);
                }
              }
            }
          }, [courseId, course]);
        } catch (error) {
          console.error('Error fetching course:', error);
          let errorMessage = 'Failed to load course. Please try again.';

          if (error instanceof Error) {
            errorMessage = error.message;
          }

          // Show error state or redirect
          setError(errorMessage);
          console.error('Setting error state:', errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCourseData();
  }, [courseId, router, authLoading, isAuthenticated, hasCheckedToken]);

  // Reset redirect state when courseId changes
  useEffect(() => {
    setHasRedirected(false);
    setRedirecting(false);
  }, [courseId]);

  // Handle automatic selection of first lesson after course data is loaded
  useEffect(() => {
    if (course && course.lessons && course.lessons.length > 0 && isClient && !redirecting && !hasRedirected && !selectedLesson) {
      const firstLesson = course.lessons[0];

      // Validate that the first lesson exists and has a valid ID
      if (!firstLesson || !firstLesson.id) {
        console.error('❌ First lesson is invalid:', firstLesson);
        setHasRedirected(true);
        return;
      }

      // Additional validation: ensure the lesson ID is actually in the course data
      const lessonExists = course.lessons.some(lesson => lesson.id === firstLesson.id);
      if (!lessonExists) {
        console.error('❌ First lesson ID not found in course data:', {
          firstLessonId: firstLesson.id,
          availableLessonIds: course.lessons.map(l => l.id)
        });
        setHasRedirected(true);
        return;
      }

      // Set the first lesson as selected instead of redirecting
      console.log('🎯 Setting first lesson as selected:', {
        courseId,
        firstLessonId: firstLesson.id,
        firstLessonTitle: firstLesson.title,
        lessonsCount: course.lessons.length
      });

      setSelectedLesson(firstLesson.id);
      setHasRedirected(true);
    }
  }, [course, courseId, isClient, redirecting, hasRedirected, selectedLesson]);

  const handleDownloadCertificate = async () => {
    if (!certificate || !course) return;

    try {
      setIsDownloading(true);
      await downloadCertificate(certificate);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleVideoComplete = (lessonId: string, completionData: {
    lessonId: string;
    courseId: string;
    completionTime: number;
    totalDuration: number;
    completionPercentage: number;
  }) => {
    console.log('🎉 Video completed:', completionData);

    // Add lesson to completed lessons if not already there
    setCompletedLessons(prev => {
      if (!prev.includes(lessonId)) {
        const newCompletedLessons = [...prev, lessonId];

        // Update course completion status
        if (course) {
          const completionPercentage = (newCompletedLessons.length / course.lessons.length) * 100;
          const isCompleted = completionPercentage >= 100;

          setCourseCompletionStatus({
            isCompleted,
            completedLessons: newCompletedLessons,
            totalLessons: course.lessons.length,
            completionPercentage
          });

          // Generate certificate if course is completed
          if (isCompleted && !certificate) {
            console.log('🏆 Course completed! Generating certificate...');
            const newCertificate = generateCertificate(
              courseId as string,
              course.title,
              'John Doe', // Replace with actual user name
              typeof course.instructor === 'object' ? course.instructor.name : course.instructor
            );
            setCertificate(newCertificate);

            // Show completion notification
            setShowCompletionNotification(true);
            console.log('🎉 Congratulations! You have completed the course and earned a certificate!');

            // Auto-hide notification after 10 seconds
            setTimeout(() => {
              setShowCompletionNotification(false);
            }, 10000);
          }
        }

        return newCompletedLessons;
      }
      return prev;
    });
  };

  const updateProgress = (lessonId: string) => {
    if (!course || !courseId || typeof courseId !== 'string') return;

    const lessonIndex = course.lessons.findIndex(l => l.id === lessonId);
    const progressValue = ((lessonIndex + 1) / course.lessons.length) * 100;

    // Save progress to localStorage (only on client side)
    if (typeof window !== 'undefined') {
      const storedProgress = localStorage.getItem('userProgress');
      const progressData = storedProgress ? JSON.parse(storedProgress) : {};

      progressData[courseId] = {
        lessonId,
        progress: progressValue,
        lastWatched: new Date().toISOString()
      };

      // Generate certificate if course is completed
      if (progressValue === 100 && !certificate) {
        const newCertificate = generateCertificate(
          courseId,
          course.title,
          'John Doe', // Replace with actual user name
          typeof course.instructor === 'object' ? course.instructor.name : course.instructor
        );
        setCertificate(newCertificate);
        progressData[courseId].certificate = newCertificate;
      }

      localStorage.setItem('userProgress', JSON.stringify(progressData));
    }
    setProgress(progressValue);
  };

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);
    updateProgress(lessonId);
  };

  // Save completion data to localStorage
  useEffect(() => {
    if (courseId && typeof window !== 'undefined' && course) {
      const completionData = {
        isCompleted: courseCompletionStatus.isCompleted,
        completedLessons: courseCompletionStatus.completedLessons,
        totalLessons: course.lessons.length,
        completionPercentage: courseCompletionStatus.completionPercentage,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`courseCompletion_${courseId}`, JSON.stringify(completionData));
    }
  }, [courseCompletionStatus, courseId, course]);

  // Load completion data from localStorage

  // Show blank loading state while checking authentication - prevent showing content to unauthenticated users
  if (!hasCheckedToken || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while redirecting or before client-side hydration
  if (loading || redirecting || !isClient) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-400">
              {redirecting ? 'Redirecting to video lessons...' : 'Loading course...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
            <p className="text-gray-400 mb-4">The course you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // If we reach here, it means the course has no lessons (coming soon)
  const currentLesson = course.lessons.find(lesson => lesson.id === selectedLesson);

  // DUAL FALLBACK instructor handling - same logic as admin page
  const instructorInfo = (() => {
    // First: Try to access the transformed instructor object (from useCourses hook)
    if (course.instructor && typeof course.instructor === 'object' && course.instructor !== null) {
      return course.instructor;
    }
    // Second: Fall back to raw API field (direct from API)
    else if ((course as any).instructor_name) {
      return {
        name: (course as any).instructor_name || 'Unknown Instructor',
        title: (course as any).instructor_title || 'Expert Educator',
        image: (course as any).instructor_image || '/images/placeholder-avatar.jpg',
        bio: (course as any).instructor_bio || 'Experienced professional in the field.'
      };
    }
    // Third: Handle string instructor (legacy format)
    else if (typeof course.instructor === 'string') {
      return {
        name: course.instructor,
        title: 'Expert Educator',
        image: '/images/placeholder-avatar.jpg',
        bio: 'Experienced professional in the field.'
      };
    }
    // Fourth: Final fallback
    else {
      return {
        name: 'Unknown Instructor',
        title: 'Expert Educator',
        image: '/images/placeholder-avatar.jpg',
        bio: 'Experienced professional in the field.'
      };
    }
  })();

  // Debug info for troubleshooting
  const debugInfo = {
    courseId: courseId,
    courseTitle: course.title,
    lessonsCount: course.lessons.length,
    selectedLesson: selectedLesson,
    progress: progress,
    hasLessons: course.lessons.length > 0,
    isComingSoon: course.comingSoon,
    instructor: instructorInfo.name,
    category: course.category,
    featured: course.featured,
    totalXP: course.totalXP
  };

  return (
    <Layout>
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-xs z-50">
          <h4 className="font-bold mb-2">🐛 Debug Info</h4>
          <div className="space-y-1">
            <div><strong>Course:</strong> {debugInfo.courseTitle}</div>
            <div><strong>Lesson:</strong> {course.lessons[0]?.title || 'None'}</div>
            <div><strong>Progress:</strong> {debugInfo.progress.toFixed(1)}%</div>
            <div><strong>Auth:</strong> Logged in</div>
            <div><strong>Error:</strong> {course.lessons.length === 0 ? 'No lessons available' : 'None'}</div>
          </div>
        </div>
      )}

      <div className="pb-16">
        {/* Course Completion Notification */}
        {showCompletionNotification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white p-6 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">🎉 Course Completed!</h3>
              <button
                onClick={() => setShowCompletionNotification(false)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <p className="text-sm mb-4">
              Congratulations! You have successfully completed "{course.title}" and earned a certificate.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
                className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                {isDownloading ? 'Downloading...' : 'Download Certificate'}
              </button>
              <button
                onClick={() => setShowCompletionNotification(false)}
                className="bg-transparent border border-white text-white px-4 py-2 rounded-md hover:bg-white hover:text-green-600 transition-colors text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Course Info Banner */}
        <div className="relative w-full bg-black py-12">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:space-x-8">
                                  {/* Left Column - Video Player */}
                    <div className="md:w-2/3 mb-8 md:mb-0">
                      {course.lessons.length > 0 && selectedLesson ? (
                        // Show VideoPlayer when course has lessons and a lesson is selected
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                          <VideoPlayer
                            lesson={course.lessons.find(l => l.id === selectedLesson)!}
                            courseId={courseId as string}
                            showProgressPanel={true}
                            onProgressUpdate={(progress) => {
                              updateProgress(selectedLesson);
                            }}
                            onSessionStart={(sessionId) => {
                              console.log('Video session started:', sessionId);
                            }}
                            onSessionEnd={(analytics) => {
                              console.log('Video session ended:', analytics);
                            }}
                            onVideoComplete={handleVideoComplete}
                          />
                        </div>
                      ) : course.comingSoon ? (
                        // Show "Coming Soon" for courses explicitly marked as coming soon
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg">
                          <h2 className="text-white text-xl font-bold mb-4">Course Coming Soon</h2>
                          <p className="text-gray-300 text-center mb-6">
                            This course is currently being developed and will be available soon.
                            We're working hard to bring you high-quality video lessons.
                          </p>

                          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                            <p className="text-gray-300 text-sm mb-3">
                              While you wait, check out these similar courses:
                            </p>
                            <div className="space-y-2">
                              <button
                                onClick={() => router.push('/course/76')}
                                className="w-full text-left p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white transition-colors"
                              >
                                📚 Fundamentals for Entrepreneurs (Course 76) - 2 lessons available
                              </button>
                              <button
                                onClick={() => router.push('/course/1')}
                                className="w-full text-left p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white transition-colors"
                              >
                                📚 Business Fundamentals for Entrepreneurs (Course 1) - 3 lessons available
                              </button>
                            </div>
                          </div>

                          <div className="flex space-x-4">
                            <button
                              onClick={() => router.push('/courses')}
                              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            >
                              Browse Other Courses
                            </button>
                            <button
                              onClick={() => router.push('/home')}
                              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                            >
                              Go to Home
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Show loading state when no lesson is selected
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
                          <p className="text-gray-300">Loading course content...</p>
                        </div>
                      )}
                    </div>

                                  {/* Right Column - Course Info & Progress Dashboard */}
                    <div className="md:w-1/3">
                      {/* Course Progress Dashboard */}
                      {course.lessons.length > 0 && (
                        <div className="mb-6">
                          <CourseProgressDashboard
                            course={course}
                            userProgress={{
                              courseId: courseId as string,
                              lessonId: selectedLesson || '',
                              completed: courseCompletionStatus.isCompleted,
                              progress: courseCompletionStatus.completionPercentage,
                              lastWatched: new Date().toISOString(),
                              xpEarned: 0,
                              completedLessons: courseCompletionStatus.completedLessons
                            }}
                            onProgressUpdate={(progress: number) => {
                              setProgress(progress);
                            }}
                            currentProgress={progress}
                            selectedLessonId={selectedLesson || undefined}
                          />
                        </div>
                      )}

                      <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    {instructorInfo.image.startsWith('http') ? (
                      <img
                        src={instructorInfo.image}
                        alt={instructorInfo.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/images/placeholder-avatar.jpg') {
                            target.src = '/images/placeholder-avatar.jpg';
                          }
                        }}
                      />
                    ) : (
                      <Image
                        src={instructorInfo.image}
                        alt={instructorInfo.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/images/placeholder-avatar.jpg') {
                            target.src = '/images/placeholder-avatar.jpg';
                          }
                        }}
                      />
                    )}
                    <div>
                      <h3 className="text-white font-medium">{instructorInfo.name}</h3>
                      <p className="text-gray-400 text-sm">{instructorInfo.title}</p>
                    </div>
                  </div>

                  <h2 className="text-white text-xl font-bold mb-2">{course.title}</h2>

                  <div className="mb-4">
                    <p className={`text-gray-300 text-sm ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                      {course.description}
                    </p>
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-red-500 text-sm flex items-center mt-1 hover:text-red-400"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show more
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 mb-6">
                    <Award className="h-5 w-5 text-red-500" />
                    <span className="text-white text-sm">
                      Lessons coming soon
                    </span>
                  </div>

                  {isClient && certificate && (
                    <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Award className="h-6 w-6 text-red-500 mr-2" />
                          <h3 className="text-white font-medium">Course Certificate</h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadCertificate}
                          disabled={isDownloading}
                        >
                          {isDownloading ? 'Downloading...' : 'Download Certificate'}
                        </Button>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Congratulations! You've completed this course and earned a certificate.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Bio */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <h2 className="text-white text-2xl font-bold mb-6">About {instructorInfo.name}</h2>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-6 md:mb-0">
              {instructorInfo.image.startsWith('http') ? (
                <img
                  src={instructorInfo.image}
                  alt={instructorInfo.name}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/images/placeholder-avatar.jpg') {
                      target.src = '/images/placeholder-avatar.jpg';
                    }
                  }}
                />
              ) : (
                <Image
                  src={instructorInfo.image}
                  alt={instructorInfo.name}
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/images/placeholder-avatar.jpg') {
                      target.src = '/images/placeholder-avatar.jpg';
                    }
                  }}
                />
              )}
            </div>
            <div className="md:w-2/3">
              <h3 className="text-white text-xl font-medium mb-2">{instructorInfo.name}</h3>
              <p className="text-red-500 font-medium mb-4">{instructorInfo.title}</p>
              <p className="text-gray-300">{instructorInfo.bio}</p>
              <Button className="mt-6" variant="primary">View All Classes</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursePage;
