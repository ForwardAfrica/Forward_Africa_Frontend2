/**
 * VideoPlayer Component
 *
 * Custom video player with controls and overlay information.
 * Supports both direct video files and YouTube URLs.
 *
 * Features:
 * - Play/pause controls (for direct videos)
 * - Volume controls (for direct videos)
 * - Progress bar with seek functionality (for direct videos)
 * - Time display (for direct videos)
 * - Fullscreen toggle
 * - Custom overlay with lesson information
 * - Hover controls
 * - YouTube video embedding
 *
 * @component
 * @example
 * ```tsx
 * <VideoPlayer lesson={lesson} />
 * ```
 */

import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX, ExternalLink, Settings, RotateCcw } from 'lucide-react';
import { Lesson } from '../../types';
import { useVideoTracking } from '../../hooks/useVideoTracking';
import RealTimeProgress from './RealTimeProgress';
import videoProgressService from '../../lib/videoProgressService';

// CSS to hide YouTube branding
const YouTubeHideBrandingStyles = `
  .youtube-container {
    position: relative;
    overflow: hidden;
  }

  .youtube-container iframe {
    border: none !important;
    display: block;
  }

  .youtube-container .ytp-watermark {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-attribution {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-title {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-youtube-button {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-endscreen-content {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-endscreen-element {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-suggestion-set {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-logo {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-watch-on-youtube {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-pause-overlay {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-pause-overlay-container {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-show-cards-button {
    display: none !important;
    visibility: hidden !important;
  }

  .youtube-container .ytp-cards-button {
    display: none !important;
    visibility: hidden !important;
  }
`;

interface VideoPlayerProps {
  /** Lesson containing video information */
  lesson: Lesson;
  /** Course ID for tracking */
  courseId?: string;
  /** Show real-time progress panel */
  showProgressPanel?: boolean;
  onProgressUpdate?: (progress: number) => void;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (analytics: any) => void;
  /** Callback when video is completed (reached 95% or more) */
  onVideoComplete?: (lessonId: string, completionData: {
    lessonId: string;
    courseId: string;
    completionTime: number;
    totalDuration: number;
    completionPercentage: number;
  }) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  courseId,
  showProgressPanel = false,
  onProgressUpdate,
  onSessionStart,
  onSessionEnd,
  onVideoComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youTubeId, setYouTubeId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [bufferTime, setBufferTime] = useState(10);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Video tracking hook
  const {
    isTracking,
    currentProgress,
    realTimeData,
    isConnected,
    updateProgress,
    recordInteraction,
    getSmartResumeTime,
    setBufferTime: setTrackingBufferTime,
    syncProgress,
    syncPlayState
  } = useVideoTracking({
    courseId: courseId || 'unknown',
    lessonId: lesson.id,
    duration: 0 // Will be updated when video loads
  });

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log(`✅ YouTube ID extracted using pattern ${i + 1}:`, match[1]);
        return match[1];
      }
    }

    console.log('❌ No YouTube ID found for URL:', url);
    return null;
  };

  // Check if the video URL is a YouTube URL and extract ID
  useEffect(() => {
    // Prevent running if lesson is not properly loaded
    if (!lesson || !lesson.videoUrl) {
      console.log('❌ No lesson or video URL provided');
      console.log('Lesson object:', lesson);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    console.log('=== VideoPlayer: Processing video URL ===');
    console.log('Lesson object:', lesson);
    console.log('Video URL:', lesson.videoUrl);
    console.log('Video URL type:', typeof lesson.videoUrl);
    console.log('Video URL length:', lesson.videoUrl.length);
    console.log('Lesson ID:', lesson.id);
    console.log('Lesson title:', lesson.title);

    const videoUrl = lesson.videoUrl;
    console.log('Processing video URL:', videoUrl);

    // Check if URL is valid
    try {
      new URL(videoUrl);
      console.log('✅ Video URL is valid');
    } catch (error) {
      console.error('❌ Video URL is invalid:', error);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const ytId = extractYouTubeId(videoUrl);
    console.log('Extracted YouTube ID:', ytId);

    if (ytId) {
      console.log('✅ YouTube video detected, ID:', ytId);
      setIsYouTube(true);
      setYouTubeId(ytId);
      setHasError(false);

      // Test if the YouTube video is accessible
      const testUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`;
      console.log('Testing YouTube accessibility with URL:', testUrl);

      fetch(testUrl)
        .then(response => {
          console.log('YouTube test response status:', response.status);
          if (response.ok) {
            console.log('✅ YouTube video is accessible');
          } else {
            console.log('❌ YouTube video is not accessible');
            setHasError(true);
          }
        })
        .catch(error => {
          console.log('❌ Error testing YouTube video accessibility:', error);
          // Don't set error immediately, let the iframe try to load
        });

      // For YouTube videos, we'll set loading to false after a short delay
      // to allow the iframe to start loading
      const loadingTimer = setTimeout(() => {
        console.log('Setting YouTube loading to false');
        setIsLoading(false);
      }, 500);

      // Add a timeout to detect if the video takes too long to load
      const timeoutTimer = setTimeout(() => {
        if (isLoading) {
          console.log('YouTube video loading timeout - checking if iframe loaded');
          // Check if iframe has loaded content
          if (iframeRef.current) {
            try {
              // Try to access iframe content (this might fail due to CORS)
              const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
              if (!iframeDoc) {
                console.log('Iframe not accessible - likely still loading or blocked');
              }
            } catch (error) {
              console.log('Iframe access blocked by CORS - this is normal for YouTube');
            }
          }
        }
      }, 10000); // 10 second timeout

      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(timeoutTimer);
      };
    } else {
      console.log('📹 Direct video file detected');
      console.log('Direct video URL:', videoUrl);
      setIsYouTube(false);
      setYouTubeId('');
      setIsLoading(true);
      setHasError(false);
    }
  }, [lesson?.videoUrl, lesson?.id, lesson?.title]);

  useEffect(() => {
    if (isYouTube) {
      console.log('Skipping video element setup for YouTube video');
      return; // Skip video element setup for YouTube videos
    }

    const video = videoRef.current;
    if (!video) {
      console.log('No video element found');
      return;
    }

    console.log('Setting up video element for direct video');

    const handleTimeUpdate = () => {
      if (video.duration && isFinite(video.duration)) {
        const progress = (video.currentTime / video.duration) * 100;
        setProgress(progress);
        setCurrentTime(video.currentTime);

        // Update video tracking
        updateProgress(video.currentTime, isPlaying, isMuted, video.playbackRate);
      }
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
        setIsLoading(false);
        setHasError(false);

        // Apply smart resume if available
        const resumeTime = getSmartResumeTime();
        if (resumeTime > 0) {
          video.currentTime = resumeTime;
          console.log('🎯 Applied smart resume at:', resumeTime, 'seconds');
        }
      }
    };

    const handleCanPlay = () => {
      console.log('Video can play');
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', video.error, e);
      setIsLoading(false);
      setHasError(true);
    };

    const handleLoadStart = () => {
      console.log('Video load started');
      setIsLoading(true);
      setHasError(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [lesson.videoUrl, isYouTube, updateProgress, getSmartResumeTime]);

  // Handle iframe load events for YouTube
  useEffect(() => {
    if (!isYouTube || !iframeRef.current) return;

    const iframe = iframeRef.current;

    const handleIframeLoad = () => {
      console.log('YouTube iframe loaded');
      setIsLoading(false);
      setHasError(false);
    };

    const handleIframeError = () => {
      console.error('YouTube iframe error');
      setIsLoading(false);
      setHasError(true);
    };

    iframe.addEventListener('load', handleIframeLoad);
    iframe.addEventListener('error', handleIframeError);

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      iframe.removeEventListener('error', handleIframeError);
    };
  }, [isYouTube, youTubeId, lesson.title]);

  // Inject YouTube branding hiding styles
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const styleId = 'youtube-hide-branding-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.innerHTML = YouTubeHideBrandingStyles;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Keep the styles in document for duration of app
    };
  }, []);

  // Start video session when component mounts
  useEffect(() => {
    if (courseId && lesson.id) {
      startVideoSession();
    }

    return () => {
      if (sessionId) {
        endVideoSession();
      }
    };
  }, [courseId, lesson.id]);

  // Start video session
  const startVideoSession = async () => {
    try {
      const deviceInfo = {
        deviceId: navigator.userAgent,
        deviceType: getDeviceType(),
        browserInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        }
      };

      const newSessionId = await videoProgressService.startSession(
        'user-id', // Replace with actual user ID
        courseId!,
        lesson.id,
        deviceInfo
      );

      setSessionId(newSessionId);
      onSessionStart?.(newSessionId);

      // Load resume point
      const resumePoint = await videoProgressService.getResumePoint(courseId!, lesson.id);
      if (resumePoint.resumeTimeSeconds > 0 && videoRef.current) {
        videoRef.current.currentTime = resumePoint.resumeTimeSeconds;
        console.log('🎯 Applied resume point:', resumePoint.resumeTimeSeconds);
      }

      // Load analytics
      const lessonAnalytics = await videoProgressService.getVideoAnalytics(courseId!, lesson.id);
      setAnalytics(lessonAnalytics);
    } catch (error) {
      console.error('Error starting video session:', error);
    }
  };

  // End video session
  const endVideoSession = async () => {
    if (!sessionId) return;

    try {
      await videoProgressService.endSession();
      onSessionEnd?.(analytics);
    } catch (error) {
      console.error('Error ending video session:', error);
    }
  };

  // Enhanced time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current || !duration || !isFinite(duration)) return;

    const currentTime = videoRef.current.currentTime;
    const progress = (currentTime / duration) * 100;

    setProgress(progress);
    setCurrentTime(currentTime);

    // Update video tracking
    updateProgress(currentTime, isPlaying, isMuted, videoRef.current.playbackRate);

    // Record progress interval every 30 seconds
    const now = Date.now();
    if (now - lastProgressUpdate >= 30000) { // 30 seconds
      recordProgressInterval(currentTime);
      setLastProgressUpdate(now);
    }

    // Update resume point every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      updateResumePoint(currentTime);
    }

    // Check for video completion (95% or more)
    if (progress >= 95 && !hasCompleted && courseId && lesson.id) {
      setHasCompleted(true);
      console.log('🎉 Video completed!', {
        lessonId: lesson.id,
        courseId,
        progress,
        currentTime,
        duration
      });

      // Call completion callback
      onVideoComplete?.(lesson.id, {
        lessonId: lesson.id,
        courseId: courseId,
        completionTime: currentTime,
        totalDuration: duration,
        completionPercentage: progress
      });

      // Record completion in analytics
      recordInteraction('video_completed', {
        lessonId: lesson.id,
        courseId: courseId,
        completionTime: currentTime,
        totalDuration: duration,
        completionPercentage: progress
      });
    }

    // Call progress update callback
    onProgressUpdate?.(progress);
  };

  // Record progress interval
  const recordProgressInterval = async (currentTime: number) => {
    if (!sessionId) return;

    const interactions = [
      { type: 'play', timestamp: Date.now() },
      { type: 'progress', currentTime, timestamp: Date.now() }
    ];

    await videoProgressService.recordInterval(
      Math.max(0, currentTime - 30),
      currentTime,
      30,
      interactions
    );
  };

  // Update resume point
  const updateResumePoint = async (currentTime: number) => {
    if (!courseId) return;

    await videoProgressService.updateResumePoint(
      courseId,
      lesson.id,
      currentTime,
      10 // 10-second buffer
    );
  };

  // Enhanced play/pause handlers
  const handlePlay = async () => {
    if (isYouTube || !videoRef.current) return;

    try {
      await videoRef.current.play();
      setIsPlaying(true);
      recordInteraction('play');

      // Set activity status
      videoProgressService.setActivityStatus(true);
    } catch (error) {
      console.error('Error playing video:', error);
      setHasError(true);
    }
  };

  const handlePause = () => {
    if (isYouTube || !videoRef.current) return;

    videoRef.current.pause();
    setIsPlaying(false);
    recordInteraction('pause');

    // Set activity status
    videoProgressService.setActivityStatus(false);
  };

  // Get device type
  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone/.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  };

  const togglePlay = async () => {
    if (isYouTube || !videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        recordInteraction('pause');
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
        recordInteraction('play');
      }
    } catch (error) {
      console.error('Error playing video:', error);
      setHasError(true);
    }
  };

  const toggleMute = () => {
    if (isYouTube || !videoRef.current) return;

    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      recordInteraction('volume_change', { volume: isMuted ? 1 : 0 });
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isYouTube || !videoRef.current || !duration || !isFinite(duration)) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;

    if (isFinite(newTime)) {
      videoRef.current.currentTime = newTime;
      recordInteraction('seek', { seekTo: newTime });
    }
  };

  const toggleFullscreen = () => {
    const element = isYouTube ?
      document.querySelector('.youtube-container') as HTMLElement :
      videoRef.current;

    if (!element) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      recordInteraction('fullscreen', { isFullscreen: false });
    } else {
      element.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
      recordInteraction('fullscreen', { isFullscreen: true });
    }
  };

  const openInYouTube = () => {
    if (youTubeId) {
      window.open(`https://www.youtube.com/watch?v=${youTubeId}`, '_blank');
    }
  };

  // Generate YouTube embed URL with proper parameters
  const getYouTubeEmbedUrl = (videoId: string) => {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1',
      origin: window.location.origin,
      autoplay: '0',
      controls: '1',
      showinfo: '0',
      fs: '1',
      cc_load_policy: '0',
      iv_load_policy: '3',
      playsinline: '1',
      allowfullscreen: '1',
      disablekb: '0',
      widget_referrer: window.location.origin
    });

    const embedUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    console.log('🎬 Generated YouTube embed URL:', embedUrl);
    return embedUrl;
  };

  console.log('=== VideoPlayer Render ===');
  console.log('isYouTube:', isYouTube);
  console.log('youTubeId:', youTubeId);
  console.log('isLoading:', isLoading);
  console.log('hasError:', hasError);

  return (
    <div className="relative aspect-video bg-black rounded-md overflow-hidden group">
      {/* Real-time Progress Panel */}
      {showProgressPanel && realTimeData && (
        <div className="absolute top-4 right-4 z-20">
          <RealTimeProgress
            data={realTimeData}
            isConnected={isConnected}
            className="w-64"
          />
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-4 left-4 z-20 bg-gray-800 rounded-lg p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Video Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* Smart Resume Buffer */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Smart Resume Buffer (seconds)
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={bufferTime}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setBufferTime(value);
                  setTrackingBufferTime(value);
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0s</span>
                <span>{bufferTime}s</span>
                <span>30s</span>
              </div>
            </div>

            {/* Tracking Status */}
            <div className="bg-gray-700 rounded p-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Tracking Status</span>
                <span className={`font-medium ${isTracking ? 'text-green-400' : 'text-red-400'}`}>
                  {isTracking ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Connection Status */}
            <div className="bg-gray-700 rounded p-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Sync Status</span>
                <span className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Smart Resume Info */}
            {!isYouTube && (
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xs text-gray-400 mb-1">Smart Resume</div>
                <div className="text-white text-xs">
                  Will resume at: {formatTime(getSmartResumeTime())}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* YouTube Video */}
      {isYouTube && youTubeId ? (
        <div className="youtube-container w-full h-full relative">
          {/* Loading State for YouTube */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-sm">Loading YouTube video...</p>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={getYouTubeEmbedUrl(youTubeId)}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            title={lesson.title}
            loading="lazy"
            style={{ border: 'none' }}
            onLoad={() => {
              console.log('✅ YouTube iframe onLoad triggered');
              setIsLoading(false);
              setHasError(false);
            }}
            onError={() => {
              console.error('❌ YouTube iframe onError triggered');
              setIsLoading(false);
              setHasError(true);
            }}
            onAbort={() => {
              console.error('❌ YouTube iframe onAbort triggered');
              setIsLoading(false);
              setHasError(true);
            }}
          />

          {/* YouTube Overlay Controls */}
          {!isLoading && !hasError && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
              {/* Top Info */}
              <div className="text-white">
                <h3 className="font-bold text-lg">{lesson.title}</h3>
                <p className="text-sm text-gray-300 mt-1">YouTube Video</p>
              </div>

              {/* Bottom Controls */}
              <div className="flex justify-between items-center pointer-events-auto">
                {/* <button
                  onClick={openInYouTube}
                  className="text-white hover:text-red-500 transition-colors bg-black/50 px-3 py-2 rounded flex items-center text-sm"
                  title="Open in YouTube"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in YouTube
                </button> */}

                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-red-500 transition-colors bg-black/50 p-2 rounded"
                  title="Fullscreen"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* YouTube Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center text-white p-6 max-w-md">
                <div className="text-red-500 mb-4">
                  <Play className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">YouTube Video Unavailable</h3>
                <p className="text-gray-300 text-sm mb-4">
                  This YouTube video could not be loaded. This might be because:
                </p>
                <ul className="text-gray-400 text-xs mb-4 text-left space-y-1">
                  <li>• The video is private or restricted</li>
                  <li>• The video has been removed</li>
                  <li>• Embedding is disabled for this video</li>
                  <li>• Network connectivity issues</li>
                  <li>• Content filtering or regional restrictions</li>
                </ul>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                      // Force iframe reload
                      if (iframeRef.current) {
                        const src = iframeRef.current.src;
                        iframeRef.current.src = '';
                        setTimeout(() => {
                          if (iframeRef.current) {
                            iframeRef.current.src = src;
                          }
                        }, 100);
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
                  >
                    Retry
                  </button>
                  <button
                    onClick={openInYouTube}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Open in YouTube
                  </button>
                  <button
                    onClick={() => {
                      // Try alternative video URL format
                      const alternativeUrl = lesson.videoUrl.replace('youtube.com/watch?v=', 'youtu.be/');
                      if (alternativeUrl !== lesson.videoUrl) {
                        console.log('Trying alternative URL format:', alternativeUrl);
                        // This would require updating the lesson object, but for now just open in new tab
                        window.open(alternativeUrl, '_blank');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
                  >
                    Try Alternative Format
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Direct Video Element */}
          <video
            ref={videoRef}
            src={lesson.videoUrl}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            onLoadStart={() => {
              console.log('📹 Video loadStart triggered');
              setIsLoading(true);
              setHasError(false);
            }}
            onLoadedMetadata={() => {
              console.log('📹 Video loadedMetadata triggered');
              console.log('Video duration:', videoRef.current?.duration);
              console.log('Video currentTime:', videoRef.current?.currentTime);
              console.log('Video readyState:', videoRef.current?.readyState);
            }}
            onCanPlay={() => {
              console.log('📹 Video canPlay triggered');
              setIsLoading(false);
              setHasError(false);
            }}
            onError={(e) => {
              console.error('📹 Video error triggered:', e);
              console.error('Video error details:', videoRef.current?.error);
              setHasError(true);
              setIsLoading(false);
            }}
            onPlay={() => {
              console.log('📹 Video play triggered');
              setIsPlaying(true);
            }}
            onPause={() => {
              console.log('📹 Video pause triggered');
              setIsPlaying(false);
            }}
          />

          {/* Loading State */}
          {isLoading && !isYouTube && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-sm">Loading video...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && !isYouTube && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white p-6 max-w-md">
                <div className="text-red-500 mb-4">
                  <Play className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Unavailable</h3>
                <p className="text-gray-300 text-sm mb-4">
                  There was an error loading this video. This might be because:
                </p>
                <ul className="text-gray-400 text-xs mb-4 text-left space-y-1">
                  <li>• The video URL is invalid or broken</li>
                  <li>• The video format is not supported</li>
                  <li>• The video requires authentication</li>
                  <li>• Network connectivity issues</li>
                </ul>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
                  >
                    Retry
                  </button>
                  {lesson.videoUrl && (
                    <button
                      onClick={() => window.open(lesson.videoUrl, '_blank')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Open Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Controls Overlay for Direct Videos */}
          {!isLoading && !hasError && !isYouTube && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
              {/* Top Info */}
              <div className="text-white">
                <h3 className="font-bold text-lg">{lesson.title}</h3>
              </div>

              {/* Center Play Button */}
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full p-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white" />
                )}
              </button>

              {/* Bottom Controls */}
              <div className="flex flex-col space-y-2">
                {/* Progress Bar */}
                <div
                  className="w-full bg-gray-600 h-1 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>

                    <button onClick={toggleMute} className="text-white hover:text-red-500 transition-colors">
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-white hover:text-red-500 transition-colors"
                      title="Video Settings"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                    <button onClick={toggleFullscreen} className="text-white hover:text-red-500 transition-colors">
                      <Maximize2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Enhanced Progress Display */}
      {showProgressPanel && analytics && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Video Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Sessions:</span>
              <span className="ml-2 font-medium">{analytics.totalSessions}</span>
            </div>
            <div>
              <span className="text-gray-600">Watch Time:</span>
              <span className="ml-2 font-medium">{Math.round(analytics.totalWatchTime / 60)}m</span>
            </div>
            <div>
              <span className="text-gray-600">Completion:</span>
              <span className="ml-2 font-medium">{analytics.completionRate}%</span>
            </div>
            <div>
              <span className="text-gray-600">Engagement:</span>
              <span className="ml-2 font-medium">{analytics.engagementScore}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
