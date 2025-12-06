import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import CourseCard from '../components/ui/CourseCard';
import { useLearnLater } from '../hooks/useLearnLater';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, RefreshCw, X, Heart } from 'lucide-react';
import { useRouter } from 'next/router';
import { courseAPI } from '../lib/api';
import { Course } from '../types';

const LearnLaterPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    learnLaterItems,
    loading,
    error,
    fetchLearnLater,
    removeFromLearnLater,
    hasInitialized,
    retryFetch
  } = useLearnLater();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(false);

  // Fetch course details for learn later items
  useEffect(() => {
    const loadCourses = async () => {
      if (learnLaterItems.length === 0) {
        setCourses([]);
        return;
      }

      setLoadingCourses(true);
      try {
        const coursePromises = learnLaterItems.map(async (item) => {
          try {
            const courseResponse = await courseAPI.getCourse(item.course_id);
            const foundCourse = courseResponse.data || courseResponse;
            
            if (!foundCourse || !foundCourse.id) {
              console.error(`Invalid course data for ${item.course_id}`);
              return null;
            }

            // Transform instructor data similar to CoursePage
            const instructorInfo = (() => {
              let instructorName = 'Unknown Instructor';
              let instructorTitle = 'Expert Educator';
              let instructorImage = '/images/placeholder-avatar.jpg';
              let instructorBio = 'No biography available.';
              let instructorEmail = 'instructor@forwardafrica.com';
              let instructorPhone = '';
              let instructorExperience = 5;
              let instructorSocialLinks = {};

              try {
                if (foundCourse.instructor && typeof foundCourse.instructor === 'object' && foundCourse.instructor !== null) {
                  instructorName = (foundCourse.instructor as any).name || 'Unknown Instructor';
                  instructorTitle = (foundCourse.instructor as any).title || 'Expert Educator';
                  instructorImage = (foundCourse.instructor as any).image || '/images/placeholder-avatar.jpg';
                  instructorBio = (foundCourse.instructor as any).bio || 'No biography available.';
                  instructorEmail = (foundCourse.instructor as any).email || 'instructor@forwardafrica.com';
                  instructorPhone = (foundCourse.instructor as any).phone || '';
                  instructorExperience = (foundCourse.instructor as any).experience || 5;
                  instructorSocialLinks = (foundCourse.instructor as any).social_links || {};
                } else if (foundCourse.instructor_name) {
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
                        instructorSocialLinks = foundCourse.instructor_social_links === '[object Object]' 
                          ? {} 
                          : JSON.parse(foundCourse.instructor_social_links);
                      } else if (typeof foundCourse.instructor_social_links === 'object') {
                        instructorSocialLinks = foundCourse.instructor_social_links;
                      }
                    }
                  } catch (error) {
                    instructorSocialLinks = {};
                  }
                } else if (typeof foundCourse.instructor === 'string') {
                  instructorName = foundCourse.instructor;
                }
              } catch (error) {
                console.error('Error accessing instructor data:', error);
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

            // Transform course data to match frontend format
            const transformedCourse: Course = {
              id: foundCourse.id,
              title: foundCourse.title,
              description: foundCourse.description || '',
              instructor: instructorInfo,
              thumbnail: foundCourse.thumbnail || foundCourse.thumbnail_url || '/images/placeholder-course.jpg',
              lessons: (foundCourse.lessons || []).map((lesson: any) => ({
                ...lesson,
                videoUrl: lesson.video_url || lesson.videoUrl,
                id: lesson.id,
                title: lesson.title,
                description: lesson.description || '',
                duration: lesson.duration || '0:00',
                course_id: lesson.course_id,
                order: lesson.order || 0,
                thumbnail: lesson.thumbnail || lesson.lesson_thumbnail || '/images/placeholder-course.jpg',
                xpPoints: lesson.xp_points || lesson.xpPoints || 0
              })),
              category: foundCourse.category || foundCourse.category_name || 'Uncategorized',
              banner: foundCourse.banner || foundCourse.banner_url || foundCourse.thumbnail || '/images/placeholder-course.jpg',
              videoUrl: foundCourse.videoUrl || foundCourse.video_url,
              featured: foundCourse.featured || false,
              totalXP: foundCourse.totalXP || foundCourse.total_xp || 1000,
              comingSoon: foundCourse.comingSoon || foundCourse.coming_soon || false,
              releaseDate: foundCourse.releaseDate || foundCourse.release_date
            };

            return transformedCourse;
          } catch (error) {
            console.error(`Failed to load course ${item.course_id}:`, error);
            return null;
          }
        });

        const loadedCourses = await Promise.all(coursePromises);
        const validCourses = loadedCourses.filter((course): course is Course => course !== null);
        console.log('✅ Loaded courses for learn later:', {
          totalItems: learnLaterItems.length,
          loadedCourses: validCourses.length,
          courses: validCourses.map(c => ({ id: c.id, title: c.title }))
        });
        setCourses(validCourses);
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (hasInitialized && learnLaterItems.length > 0) {
      loadCourses();
    } else if (hasInitialized && learnLaterItems.length === 0) {
      setCourses([]);
      setLoadingCourses(false);
    }
  }, [learnLaterItems, hasInitialized]);

  const handleLoadLearnLater = async () => {
    await fetchLearnLater();
  };

  // Auto-fetch learn later items on mount if user is logged in
  useEffect(() => {
    if (!hasInitialized && user?.id) {
      fetchLearnLater();
    }
  }, [hasInitialized, user?.id, fetchLearnLater]);

  const handleRemoveItem = async (itemId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFromLearnLater(itemId);
  };

  // Show loading state
  if (loading || loadingCourses) {
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your learn later items...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-white text-4xl font-bold">Learn Later</h1>
                <button
                  onClick={() => router.push('/favorites')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  <span>Favorites</span>
                </button>
              </div>
              <p className="text-gray-300">
                Courses and lessons you've saved for later
              </p>
            </div>
            <button
              onClick={handleLoadLearnLater}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-400">Error</div>
                <div className="text-red-300 text-sm">{error}</div>
              </div>
              <button
                onClick={retryFetch}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!hasInitialized ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">Load Your Learn Later Items</h3>
            <p className="text-gray-400 mb-6">Click the button below to load your saved courses and lessons.</p>
            <button
              onClick={handleLoadLearnLater}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Load Learn Later
            </button>
          </div>
        ) : learnLaterItems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No items saved yet</h3>
            <p className="text-gray-400 mb-4">Start exploring courses and add them to your learn later list.</p>
            <button
              onClick={() => router.push('/courses')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : courses.length === 0 && !loadingCourses ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">Loading courses...</h3>
            <p className="text-gray-400 mb-4">Please wait while we load your saved courses.</p>
            <p className="text-gray-500 text-sm">Found {learnLaterItems.length} saved {learnLaterItems.length === 1 ? 'item' : 'items'}</p>
          </div>
        ) : (
          <div>
            {/* Group by course category */}
            {(() => {
              const coursesByCategory = courses.reduce((acc, course) => {
                const category = course.category || 'Uncategorized';
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(course);
                return acc;
              }, {} as Record<string, Course[]>);

              return Object.entries(coursesByCategory).map(([category, categoryCourses]) => (
                <div key={category} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-2xl font-semibold">{category}</h2>
                    <span className="text-gray-400 text-sm">{categoryCourses.length} {categoryCourses.length === 1 ? 'course' : 'courses'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryCourses.map((course) => {
                      const learnLaterItem = learnLaterItems.find(item => item.course_id === course.id);
                      return (
                        <div key={course.id} className="relative">
                          <CourseCard course={course} showFavoriteButton={true} />
                          {learnLaterItem && (
                            <button
                              onClick={(e) => handleRemoveItem(learnLaterItem.id, e)}
                              className="absolute top-2 right-2 p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors z-10"
                              title="Remove from Learn Later"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LearnLaterPage;

