import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';
import { authService } from '../lib/authService';

// API configuration - use Next.js API routes
const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');

export interface LearnLaterItem {
  id: string;
  course_id: string;
  lesson_id?: string;
  course: Course;
  created_at: string;
}

export const useLearnLater = () => {
  const { user } = useAuth();
  const [learnLaterItems, setLearnLaterItems] = useState<LearnLaterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }, []);

  const fetchLearnLater = useCallback(async (retry = false) => {
    if (!user?.id) {
      console.log('No user ID available, skipping learn later fetch');
      setError('Please log in to view your learn later items');
      setLoading(false);
      return;
    }

    // Check if user has a valid token
    const token = authService.getToken();
    if (!token) {
      console.log('No authentication token found');
      setError('Please log in to view your learn later items');
      setLoading(false);
      return;
    }

    if (retry) {
      setRetryCount(prev => prev + 1);
    } else {
      setRetryCount(0);
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/learn-later` : '/api/learn-later';
      console.log('Fetching learn later from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      console.log('Learn later response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Learn later API error response:', errorText);

        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You may not have permission to view learn later items.');
        } else if (response.status === 404) {
          // If endpoint doesn't exist, return empty array (will be created on first add)
          setLearnLaterItems([]);
          setLoading(false);
          setHasInitialized(true);
          return;
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to fetch learn later items: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('Learn later data received:', data);

      if (Array.isArray(data)) {
        setLearnLaterItems(data);
      } else if (data.data && Array.isArray(data.data)) {
        setLearnLaterItems(data.data);
      } else {
        console.warn('Unexpected learn later data format:', data);
        setLearnLaterItems([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch learn later items';
      setError(errorMessage);
      console.error('Error fetching learn later:', err);

      // Only retry on network errors, not server errors or auth errors
      const shouldRetry = retryCount < 2 &&
        !errorMessage.includes('Authentication') &&
        !errorMessage.includes('Access denied') &&
        !errorMessage.includes('Server error') &&
        !errorMessage.includes('endpoint not found') &&
        !errorMessage.includes('Please log in');

      if (shouldRetry) {
        console.log(`Retrying learn later fetch (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchLearnLater(true), 1000 * (retryCount + 1));
      } else {
        console.log('Not retrying due to error type or max retries reached');
      }
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  }, [user?.id, getAuthHeaders, retryCount]);

  const addToLearnLater = useCallback(async (courseId: string, lessonId?: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      console.log('Adding to learn later:', { courseId, lessonId });

      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/learn-later` : '/api/learn-later';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ course_id: courseId, lesson_id: lessonId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Add to learn later error response:', errorText);

        if (response.status === 400) {
          throw new Error('Item is already in your learn later list');
        } else if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('Course or lesson not found');
        } else {
          throw new Error(`Failed to add to learn later: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Add to learn later success:', result);

      // Refresh learn later list after adding
      await fetchLearnLater();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to learn later';
      setError(errorMessage);
      console.error('Error adding to learn later:', err);
      return false;
    }
  }, [user?.id, getAuthHeaders, fetchLearnLater]);

  const removeFromLearnLater = useCallback(async (itemId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      console.log('Removing from learn later:', itemId);

      const apiUrl = API_BASE_URL ? `${API_BASE_URL}/api/learn-later/${itemId}` : `/api/learn-later/${itemId}`;
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Remove from learn later error response:', errorText);

        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('Item not found in learn later list');
        } else {
          throw new Error(`Failed to remove from learn later: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Remove from learn later success:', result);

      // Refresh learn later list after removing
      await fetchLearnLater();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from learn later';
      setError(errorMessage);
      console.error('Error removing from learn later:', err);
      return false;
    }
  }, [user?.id, getAuthHeaders, fetchLearnLater]);

  const isInLearnLater = useCallback((courseId: string, lessonId?: string) => {
    if (lessonId) {
      return learnLaterItems.some(item => item.course_id === courseId && item.lesson_id === lessonId);
    }
    return learnLaterItems.some(item => item.course_id === courseId);
  }, [learnLaterItems]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryFetch = useCallback(() => {
    fetchLearnLater(true);
  }, [fetchLearnLater]);

  // Only fetch learn later when user logs in, not on every mount
  useEffect(() => {
    if (user?.id && !hasInitialized) {
      // Don't automatically fetch - wait for user interaction
      console.log('User logged in, but waiting for explicit learn later fetch');
    } else if (!user?.id) {
      // Clear learn later when user logs out
      setLearnLaterItems([]);
      setError(null);
      setHasInitialized(false);
    }
  }, [user?.id, hasInitialized]);

  return {
    learnLaterItems,
    loading,
    error,
    addToLearnLater,
    removeFromLearnLater,
    fetchLearnLater,
    isInLearnLater,
    clearError,
    retryFetch,
    retryCount,
    hasInitialized
  };
};

