/**
 * CourseCard Component
 *
 * Displays a course card with thumbnail, title, and instructor information.
 * Includes hover effects and play button overlay.
 *
 * @component
 * @example
 * ```tsx
 * <CourseCard course={courseData} />
 * ```
 */

import React from 'react';
import { Play, Clock, Star, User, Award, TrendingUp, Users, Calendar, MapPin, Globe, Building2, GraduationCap, Briefcase, Target, Zap, ChevronRight, CheckCircle, AlertTriangle, Info, ExternalLink, Download, Share2, Heart, MessageCircle, Eye, EyeOff, Lock, Unlock, Shield, Crown, Medal, Trophy, Badge, Flag, Rocket, Diamond } from 'lucide-react';
import { Course } from '../../types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/authService';

interface CourseCardProps {
  /** Course data to display */
  course: Course;
  showFavoriteButton?: boolean;
  rowId?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, showFavoriteButton = true, rowId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = React.useState(false);
  const [hoveredCardId, setHoveredCardId] = React.useState<string | null>(null);

  const {
    favorites,
    addToFavorites,
    removeFromFavorites,
    loading: favoritesLoading,
    error: favoritesError,
    clearError,
    fetchFavorites,
    hasInitialized
  } = useFavorites();
  const isFavorited = favorites.some(fav => fav.id === course.id);

  // Handle card hover - add white border to show active card
  const handleCardHover = (e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    card.classList.add('active');
  };

  const handleCardLeave = (e: React.MouseEvent) => {
    const card = e.currentTarget as HTMLElement;
    card.classList.remove('active');
  };

  // Early return for null/undefined course
  if (!course) {
    return (
      <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl bg-gray-800 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Validate course structure
  if (typeof course !== 'object') {
    return (
      <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl bg-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Invalid Course Data</p>
        </div>
      </div>
    );
  }

  // MINIMAL TEST VERSION - just show basic info
  const courseId = course.id || 'unknown-course';
  const title = course.title || 'Untitled Course';
  const thumbnail = course.thumbnail || '/images/placeholder-course.jpg';

  // DUAL FALLBACK instructor handling - same logic as admin page
  let instructorName = 'Unknown Instructor';
  let instructorImage = '/images/placeholder-avatar.jpg';

  try {
    // First: Try to access the transformed instructor object (from useCourses hook)
    if (course.instructor && typeof course.instructor === 'object' && course.instructor !== null) {
      instructorName = (course.instructor as any).name || 'Unknown Instructor';
      instructorImage = (course.instructor as any).image || '/images/placeholder-avatar.jpg';
    }
    // Second: Fall back to raw API field (direct from API)
    else if ((course as any).instructor_name) {
      instructorName = (course as any).instructor_name || 'Unknown Instructor';
      instructorImage = (course as any).instructor_image || '/images/placeholder-avatar.jpg';
    }
    // Third: Handle string instructor (legacy format)
    else if (typeof course.instructor === 'string') {
      instructorName = course.instructor;
      instructorImage = '/images/placeholder-avatar.jpg';
    }
    // Fourth: Final fallback
    else {
      instructorName = 'Unknown Instructor';
      instructorImage = '/images/placeholder-avatar.jpg';
    }
  } catch (error) {
    console.error('Error accessing instructor data:', error);
    instructorName = 'Unknown Instructor';
    instructorImage = '/images/placeholder-avatar.jpg';
  }

  // Check if course is coming soon (only when explicitly marked)
  const isComingSoon = course.comingSoon === true;

  // Check if course is playable (has lessons and not coming soon)
  const isPlayable = course.lessons && course.lessons.length > 0 && !isComingSoon;

  // Handle course card click
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();



    // Don't navigate if course is coming soon
    if (isComingSoon) {
      console.log('Course is coming soon, no navigation');
      return;
    }

    // Check if course has lessons
    if (course.lessons && course.lessons.length > 0) {
      const firstLessonId = course.lessons[0].id;
      const lessonUrl = `/course/${courseId}/lesson/${firstLessonId}`;

      // Prevent navigation if already on the target route
      if (router.asPath === lessonUrl) {
        console.log('Already on target lesson, skipping navigation');
        return;
      }

      console.log('Navigating to lesson:', lessonUrl);
      // Use replace to prevent navigation loops
      router.replace(lessonUrl);
    } else {
      console.log('No lessons found, navigating to course page');
      const courseUrl = `/course/${courseId}`;

      // Prevent navigation if already on the target route
      if (router.asPath === courseUrl) {
        console.log('Already on course page, skipping navigation');
        return;
      }

      // Navigate to course page if no lessons
      router.replace(courseUrl);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const token = authService.getToken();
    if (!token) {
      console.log('User not logged in, cannot add to favorites');
      router.push('/login');
      return;
    }

    // Clear any previous errors
    clearError();

    try {
      // If this is the first time clicking a favorite button, fetch favorites first
      if (!hasInitialized) {
        console.log('First time clicking favorite button, fetching favorites...');
        await fetchFavorites();
      }

      if (isFavorited) {
        await removeFromFavorites(course.id);
      } else {
        await addToFavorites(course.id);
      }
    } catch (error) {
      console.error('Error handling favorite action:', error);
    }
  };

  return (
    <div
      className="card-container group cursor-pointer"
      onMouseEnter={handleCardHover}
      onMouseLeave={handleCardLeave}
      onClick={handleCardClick}
      data-row-id={rowId}
    >
      <div className="relative w-full h-80">
        {/* Poster Container */}
        <div className="w-full h-full relative rounded-lg overflow-hidden shadow-xl bg-brand-surface">
          {/* Thumbnail */}
          {thumbnail.startsWith('http') ? (
            // Use regular img tag for external URLs to avoid Next.js Image issues
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover card-landscape-image"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/images/placeholder-course.jpg') {
                  target.src = '/images/placeholder-course.jpg';
                }
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          ) : (
            // Use Next.js Image for local images
            <Image
              src={thumbnail}
              alt={title}
              width={400}
              height={600}
              className="w-full h-full object-cover card-landscape-image"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/images/placeholder-course.jpg') {
                  target.src = '/images/placeholder-course.jpg';
                }
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          )}


          {/* Coming Soon Overlay */}
          {isComingSoon && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-black bg-opacity-50">
              <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg border border-yellow-300">
                <Clock className="h-5 w-5 inline mr-2" />
                <span className="font-semibold text-sm">Coming Soon</span>
              </div>
            </div>
          )}


          {/* Coming Soon Badge - Top Left */}
          {isComingSoon && (
            <div className="absolute top-2 left-2 z-20 bg-yellow-500 text-white px-2 py-1 rounded-full shadow-md border border-yellow-300">
              <Clock className="h-3 w-3 inline mr-1" />
              <span className="text-xs font-semibold">SOON</span>
            </div>
          )}

          {/* Action Buttons Container */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            {/* Favorite Button */}
            {showFavoriteButton && (
              <button
                onClick={handleFavoriteClick}
                disabled={favoritesLoading}
                className={`p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors ${
                  favoritesLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={
                  favoritesError
                    ? favoritesError
                    : !authService.getToken()
                      ? 'Please log in to add favorites'
                      : !hasInitialized
                        ? 'Click to load favorites'
                        : isFavorited
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                }
              >
                {favoritesLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Heart
                    className={`h-5 w-5 ${
                      favoritesError
                        ? 'text-yellow-500'
                        : !authService.getToken()
                          ? 'text-gray-500' // Gray when not logged in
                          : !hasInitialized
                            ? 'text-gray-400' // Gray when not initialized
                            : isFavorited
                              ? 'text-red-500 fill-current'
                              : 'text-white'
                    }`}
                  />
                )}
              </button>
            )}
          </div>
          
          {/* Error Tooltips */}
          {favoritesError && (
            <div className="absolute top-full right-3 mt-2 px-3 py-2 bg-yellow-500 text-white text-xs rounded-lg shadow-lg z-50 max-w-xs">
              <div className="font-medium">Favorites Error</div>
              <div className="text-yellow-100">{favoritesError}</div>
              <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-yellow-500"></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CourseCard;