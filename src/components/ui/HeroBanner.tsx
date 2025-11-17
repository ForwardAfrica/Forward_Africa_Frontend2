import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { Course } from '../../types';
import Button from './Button';
import Image from 'next/image';

interface BannerConfig {
  homepage_banner_enabled: boolean;
  homepage_banner_type: 'video' | 'image' | 'course';
  homepage_banner_video_url: string | null;
  homepage_banner_image_url: string | null;
  homepage_banner_title: string | null;
  homepage_banner_subtitle: string | null;
  homepage_banner_description: string | null;
  homepage_banner_button_text: string;
  homepage_banner_button_url: string | null;
  homepage_banner_overlay_opacity: number;
}

interface HeroBannerProps {
  course: Course;
  onPlay: (courseId: string) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ course, onPlay }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);
  const [loadingBannerConfig, setLoadingBannerConfig] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load banner configuration with periodic refresh
  const loadBannerConfig = async () => {
    try {
      const response = await fetch('/api/banner/config');
      if (response.ok) {
        const config = await response.json();
        console.log('📋 Loaded banner config:', config);
        setBannerConfig(config);
      } else {
        console.error('Failed to load banner config:', response.status);
      }
    } catch (error) {
      console.error('Error loading banner config:', error);
    } finally {
      setLoadingBannerConfig(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadBannerConfig();

    // Set up periodic refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      loadBannerConfig();
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Listen for banner update events
  useEffect(() => {
    const handleBannerUpdate = () => {
      console.log('🔄 Banner update detected, refreshing...');
      loadBannerConfig();
    };

    // Listen for custom event
    window.addEventListener('banner-updated', handleBannerUpdate);

    // Also listen for storage events (in case config is updated via API)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'banner-config-updated') {
        console.log('🔄 Banner config updated via storage event');
        loadBannerConfig();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('banner-updated', handleBannerUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const videoUrl = course.videoUrl || 'https://www.youtube.com/watch?v=8jPQjjsBbIc';

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    } else if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    }
    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVideoLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoError = () => {
    setIsVideoError(true);
  };

  // Determine what to display based on banner configuration
  const shouldUseCustomBanner = bannerConfig?.homepage_banner_enabled && bannerConfig?.homepage_banner_type !== 'course';
  const customBannerType = bannerConfig?.homepage_banner_type;
  const customBannerVideoUrl = bannerConfig?.homepage_banner_video_url;
  const customBannerImageUrl = bannerConfig?.homepage_banner_image_url;

  console.log('🎬 Banner debug:', {
    bannerConfig,
    shouldUseCustomBanner,
    customBannerType,
    customBannerVideoUrl,
    customBannerImageUrl
  });

  // Show loading state while banner config is loading
  if (loadingBannerConfig) {
    return (
      <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-brand-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  console.log('🎬 Rendering banner with:', {
    shouldUseCustomBanner,
    customBannerType,
    customBannerVideoUrl,
    customBannerImageUrl
  });

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        {shouldUseCustomBanner ? (
          // Custom banner content
          <>
            {customBannerType === 'video' && customBannerVideoUrl ? (
              <video
                src={customBannerVideoUrl}
                className="object-cover w-full h-full"
                autoPlay
                muted
                loop
                playsInline
                onLoadStart={() => console.log('🎬 Video loading started')}
                onLoadedData={() => console.log('🎬 Video loaded successfully')}
                onError={(e) => console.error('🎬 Video error:', e)}
              />
            ) : customBannerType === 'image' && customBannerImageUrl ? (
              customBannerImageUrl.startsWith('http') ? (
                <img
                  src={customBannerImageUrl}
                  alt="Custom Banner"
                  className="object-cover w-full h-full"
                  onLoad={() => console.log('🎬 Image loaded successfully:', customBannerImageUrl)}
                  onError={(e) => {
                    console.error('🎬 Image error:', customBannerImageUrl);
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-course.jpg';
                  }}
                />
              ) : (
                <Image
                  src={customBannerImageUrl}
                  alt="Custom Banner"
                  width={1920}
                  height={1080}
                  className="object-cover w-full h-full"
                  onLoad={() => console.log('🎬 Next.js Image loaded successfully:', customBannerImageUrl)}
                  onError={(e) => {
                    console.error('🎬 Next.js Image error:', customBannerImageUrl);
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-course.jpg';
                  }}
                />
              )
            ) : (
              // Fallback to course banner
              !isVideoError && embedUrl ? (
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  className="object-cover w-full h-full"
                  style={{ opacity: isVideoLoaded ? 1 : 0 }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={handleVideoError}
                />
              ) : (
                (course.banner || '/images/placeholder-course.jpg').startsWith('http') ? (
                  <img
                    src={course.banner || '/images/placeholder-course.jpg'}
                    alt={course.title || 'Course Banner'}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-course.jpg';
                    }}
                  />
                ) : (
                  <Image
                    src={course.banner || '/images/placeholder-course.jpg'}
                    alt={course.title || 'Course Banner'}
                    width={1920}
                    height={1080}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-course.jpg';
                    }}
                  />
                )
              )
            )}
          </>
        ) : (
          // Default course banner
          !isVideoError && embedUrl ? (
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="object-cover w-full h-full"
              style={{ opacity: isVideoLoaded ? 1 : 0 }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={handleVideoError}
            />
          ) : (
            (course.banner || '/images/placeholder-course.jpg').startsWith('http') ? (
              <img
                src={course.banner || '/images/placeholder-course.jpg'}
                alt={course.title || 'Course Banner'}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-course.jpg';
                }}
              />
            ) : (
              <Image
                src={course.banner || '/images/placeholder-course.jpg'}
                alt={course.title || 'Course Banner'}
                width={1920}
                height={1080}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder-course.jpg';
                }}
              />
            )
          )
        )}

        {/* Overlay - use custom opacity if available */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-background via-brand-background/70 to-transparent"
          style={shouldUseCustomBanner && bannerConfig?.homepage_banner_overlay_opacity !== undefined ? {
            backgroundColor: `rgba(0, 0, 0, ${bannerConfig.homepage_banner_overlay_opacity})`
          } : {}}
        ></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col items-start">
        {shouldUseCustomBanner ? (
          // Custom banner content
          <>
            {bannerConfig?.homepage_banner_subtitle && (
              <span className="text-sm md:text-base text-brand-primary font-semibold mb-2">
                {bannerConfig.homepage_banner_subtitle}
              </span>
            )}
            {bannerConfig?.homepage_banner_title && (
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                {bannerConfig.homepage_banner_title}
              </h1>
            )}
          </>
        ) : (
          // Default course content
          <>
            <span className="text-sm md:text-base text-brand-primary font-semibold mb-2">FEATURED MASTER CLASS</span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{course.title || 'Featured Course'}</h1>
          </>
        )}
        {/* DUAL FALLBACK instructor handling - same logic as admin page */}
        {(() => {
          // Get instructor info with dual fallback
          let instructorName = 'Unknown Instructor';
          let instructorTitle = 'Course Instructor';
          let instructorImage = '/images/placeholder-avatar.jpg';

          try {
            // First: Try to access the transformed instructor object (from useCourses hook)
            if (course.instructor && typeof course.instructor === 'object' && course.instructor !== null) {
              instructorName = (course.instructor as any).name || 'Unknown Instructor';
              instructorTitle = (course.instructor as any).title || 'Course Instructor';
              instructorImage = (course.instructor as any).image || '/images/placeholder-avatar.jpg';
            }
            // Second: Fall back to raw API field (direct from API)
            else if ((course as any).instructor_name) {
              instructorName = (course as any).instructor_name || 'Unknown Instructor';
              instructorTitle = (course as any).instructor_title || 'Course Instructor';
              instructorImage = (course as any).instructor_image || '/images/placeholder-avatar.jpg';
            }
            // Third: Handle string instructor (legacy format)
            else if (typeof course.instructor === 'string') {
              instructorName = course.instructor;
              instructorTitle = 'Course Instructor';
              instructorImage = '/images/placeholder-avatar.jpg';
            }
            // Fourth: Final fallback
            else {
              instructorName = 'Unknown Instructor';
              instructorTitle = 'Course Instructor';
              instructorImage = '/images/placeholder-avatar.jpg';
            }
          } catch (error) {
            console.error('Error accessing instructor data:', error);
            instructorName = 'Unknown Instructor';
            instructorTitle = 'Course Instructor';
            instructorImage = '/images/placeholder-avatar.jpg';
          }

          return (
            <div className="flex items-center mb-4">
              {instructorImage.startsWith('http') ? (
                <img
                  src={instructorImage}
                  alt={instructorName}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-avatar.jpg';
                  }}
                />
              ) : (
                <Image
                  src={instructorImage}
                  alt={instructorName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-avatar.jpg';
                  }}
                />
              )}
              <div>
                <p className="text-white font-medium">{instructorName}</p>
                <p className="text-gray-300 text-sm">{instructorTitle}</p>
              </div>
            </div>
          );
        })()}
        {shouldUseCustomBanner ? (
          // Custom banner content
          <>
            {bannerConfig?.homepage_banner_description && (
              <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-6">
                {bannerConfig.homepage_banner_description}
              </p>
            )}
            {bannerConfig?.homepage_banner_button_text && (
              <div className="flex space-x-4">
                {bannerConfig.homepage_banner_button_url ? (
                  <a
                    href={bannerConfig.homepage_banner_button_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="group"
                    >
                      <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      {bannerConfig.homepage_banner_button_text}
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="group"
                  >
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {bannerConfig.homepage_banner_button_text}
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          // Default course content
          <>
            <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-6">
              {course.description || 'Learn from industry experts and advance your skills with our comprehensive course.'}
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => onPlay(course.id || 'default-course')}
                variant="primary"
                size="lg"
                className="group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch First Lesson
              </Button>
              <Button variant="outline" size="lg">More Info</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;