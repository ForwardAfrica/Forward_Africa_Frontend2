import { VideoProgress, VideoAnalytics } from '../types';
import { apiRequest } from './api';

interface ResumePoint {
  resumeTimeSeconds: number;
  bufferTimeSeconds: number;
}

/**
 * Enhanced Video Progress Service
 * Handles comprehensive video progress tracking with database integration
 */
class VideoProgressService {
  private currentSessionId: string | null = null;
  private sessionStartTime: number = 0;
  private totalWatchTime: number = 0;
  private intervals: any[] = [];
  private isActive: boolean = true;
  private activityTimeout: NodeJS.Timeout | null = null;

  /**
   * Start a new video progress session
   */
  async startSession(
    userId: string,
    courseId: string,
    lessonId: string,
    deviceInfo: any
  ): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await apiRequest('/video-progress/sessions/start', {
        method: 'POST',
        body: JSON.stringify({
          courseId,
          lessonId,
          deviceId: deviceInfo.deviceId,
          deviceType: deviceInfo.deviceType,
          browserInfo: deviceInfo.browserInfo
        })
      });

      this.currentSessionId = sessionId;
      this.sessionStartTime = Date.now();
      this.totalWatchTime = 0;
      this.intervals = [];

      console.log('🎬 Video session started:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error starting video session:', error);
      throw error;
    }
  }

  /**
   * End the current video session
   */
  async endSession(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const sessionDuration = Date.now() - this.sessionStartTime;
      const engagementRate = this.calculateEngagementRate();

      await apiRequest(`/video-progress/sessions/${this.currentSessionId}/end`, {
        method: 'PUT',
        body: JSON.stringify({
          totalWatchTime: this.totalWatchTime,
          engagementRate
        })
      });

      console.log('⏹️ Video session ended:', this.currentSessionId);
      this.currentSessionId = null;
    } catch (error) {
      console.error('Error ending video session:', error);
      throw error;
    }
  }

  /**
   * Record a progress interval (30-second granular tracking)
   */
  async recordInterval(
    startTimeSeconds: number,
    endTimeSeconds: number,
    timeSpentSeconds: number,
    interactions: any[]
  ): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const interval = {
        startTimeSeconds,
        endTimeSeconds,
        timeSpentSeconds,
        isActive: this.isActive,
        interactions
      };

      await apiRequest('/video-progress/intervals', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: this.currentSessionId,
          ...interval
        })
      });

      this.intervals.push(interval);
      this.totalWatchTime += timeSpentSeconds;

      console.log('📊 Progress interval recorded:', interval);
    } catch (error) {
      console.error('Error recording progress interval:', error);
      throw error;
    }
  }

  /**
   * Update resume point
   */
  async updateResumePoint(
    courseId: string,
    lessonId: string,
    resumeTimeSeconds: number,
    bufferTimeSeconds: number = 10
  ): Promise<void> {
    try {
      await apiRequest('/video-progress/resume-points', {
        method: 'PUT',
        body: JSON.stringify({
          courseId,
          lessonId,
          resumeTimeSeconds,
          bufferTimeSeconds,
          deviceId: this.getDeviceId(),
          sessionId: this.currentSessionId
        })
      });

      console.log('🎯 Resume point updated:', { courseId, lessonId, resumeTimeSeconds });
    } catch (error) {
      console.error('Error updating resume point:', error);
      throw error;
    }
  }

  /**
   * Get resume point for a lesson
   */
  async getResumePoint(courseId: string, lessonId: string): Promise<ResumePoint> {
    try {
      const resumePoint = await apiRequest(`/video-progress/resume-points/${courseId}/${lessonId}`);
      return resumePoint;
    } catch (error) {
      console.error('Error fetching resume point:', error);
      return { resumeTimeSeconds: 0, bufferTimeSeconds: 10 };
    }
  }

  /**
   * Get video analytics for a lesson
   */
  async getVideoAnalytics(courseId: string, lessonId: string): Promise<VideoAnalytics> {
    try {
      const analytics = await apiRequest(`/video-progress/analytics/${courseId}/${lessonId}`);
      return analytics;
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      return {
        totalSessions: 0,
        totalWatchTime: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        engagementScore: 0
      };
    }
  }

  /**
   * Update video analytics
   */
  async updateVideoAnalytics(
    courseId: string,
    lessonId: string,
    analytics: Partial<VideoAnalytics>
  ): Promise<void> {
    try {
      await apiRequest(`/video-progress/analytics/${courseId}/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify(analytics)
      });

      console.log('��� Video analytics updated:', analytics);
    } catch (error) {
      console.error('Error updating video analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate engagement rate based on active time vs total time
   */
  private calculateEngagementRate(): number {
    if (this.totalWatchTime === 0) return 0;
    
    const sessionDuration = Date.now() - this.sessionStartTime;
    return (this.totalWatchTime / sessionDuration) * 100;
  }

  /**
   * Get device information
   */
  private getDeviceId(): string {
    return navigator.userAgent || 'unknown';
  }

  /**
   * Set activity status
   */
  setActivityStatus(isActive: boolean): void {
    this.isActive = isActive;
    
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }

    if (!isActive) {
      this.activityTimeout = setTimeout(() => {
        this.isActive = false;
      }, 30000); // 30 seconds of inactivity
    }
  }

  /**
   * Get current session info
   */
  getCurrentSession(): { sessionId: string | null; totalWatchTime: number } {
    return {
      sessionId: this.currentSessionId,
      totalWatchTime: this.totalWatchTime
    };
  }
}

export default new VideoProgressService();
