// Instructors Service - Now using Backend API Endpoints
// All Firestore operations have been migrated to backend API routes

import { Instructor } from '../types';

/**
 * Fetch all instructors from backend
 */
export async function getAllInstructorsFromFirestore(): Promise<Instructor[]> {
  try {
    const response = await fetch('/api/instructors', {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch instructors: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching instructors from backend:', error);
    throw error;
  }
}

/**
 * Fetch a specific instructor by ID
 */
export async function getInstructorFromFirestore(instructorId: string): Promise<Instructor | null> {
  try {
    const response = await fetch(`/api/instructors/${instructorId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch instructor: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching instructor from backend:', error);
    throw error;
  }
}

/**
 * Fetch instructor by email
 */
export async function getInstructorByEmailFromFirestore(email: string): Promise<Instructor | null> {
  try {
    const response = await fetch(`/api/instructors/by-email/${encodeURIComponent(email)}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch instructor by email: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Error fetching instructor by email from backend:', error);
    throw error;
  }
}

/**
 * Create a new instructor
 */
export async function createInstructorInFirestore(instructor: Omit<Instructor, 'id' | 'createdAt'>): Promise<string> {
  try {
    const response = await fetch('/api/instructors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: instructor.name,
        title: instructor.title,
        email: instructor.email,
        phone: instructor.phone || null,
        bio: instructor.bio,
        image: instructor.image,
        experience: instructor.experience,
        expertise: instructor.expertise || [],
        socialLinks: instructor.socialLinks || {
          linkedin: '',
          twitter: '',
          website: ''
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create instructor: ${response.statusText}`);
    }

    const data = await response.json();
    return data.instructorId;
  } catch (error) {
    console.error('Error creating instructor in backend:', error);
    throw error;
  }
}

/**
 * Update an existing instructor
 */
export async function updateInstructorInFirestore(instructorId: string, instructor: Partial<Instructor>): Promise<void> {
  try {
    const updateData: any = {};

    if (instructor.name) updateData.name = instructor.name;
    if (instructor.title) updateData.title = instructor.title;
    if (instructor.email) updateData.email = instructor.email;
    if (instructor.phone !== undefined) updateData.phone = instructor.phone;
    if (instructor.bio) updateData.bio = instructor.bio;
    if (instructor.image) updateData.image = instructor.image;
    if (instructor.experience !== undefined) updateData.experience = instructor.experience;
    if (instructor.expertise) updateData.expertise = instructor.expertise;
    if (instructor.socialLinks) updateData.socialLinks = instructor.socialLinks;

    const response = await fetch(`/api/instructors/${instructorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update instructor: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating instructor in backend:', error);
    throw error;
  }
}

/**
 * Delete an instructor
 */
export async function deleteInstructorFromFirestore(instructorId: string): Promise<void> {
  try {
    const response = await fetch(`/api/instructors/${instructorId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete instructor: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting instructor from backend:', error);
    throw error;
  }
}

/**
 * Fetch all instructors with pagination
 */
export async function getInstructorsWithPaginationFromFirestore(pageSize: number = 10): Promise<Instructor[]> {
  try {
    const response = await fetch(`/api/instructors?limit=${pageSize}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch instructors: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching instructors with pagination from backend:', error);
    throw error;
  }
}
