import { Instructor } from '../types';
import { instructorAPI } from './api';
import { authService } from './authService';

export interface InstructorFormData {
  name: string;
  title: string;
  email: string;
  phone: string;
  bio: string;
  image: string;
  experience: number;
  expertise: string[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    website: string;
  };
}

export interface InstructorValidationError {
  field: string;
  message: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
}

export class InstructorServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'InstructorServiceError';
  }
}

export class InstructorService {
  /**
   * Checks if the current user has permission to create/manage instructors
   */
  static checkInstructorPermission(): void {
    const user = authService.getUserFromToken();

    if (!user) {
      throw new InstructorServiceError(
        'You are not authenticated. Please log in to create instructors.',
        401,
        'UNAUTHENTICATED'
      );
    }

    // Check if user has the required role
    const allowedRoles = ['super_admin', 'content_manager'];
    if (!allowedRoles.includes(user.role)) {
      throw new InstructorServiceError(
        `Missing or insufficient permissions. Only Super Admin and Content Manager roles can create instructors. Your current role: ${user.role}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }
  }

  /**
   * Validates instructor form data
   */
  static validateInstructorData(data: InstructorFormData): InstructorValidationError[] {
    const errors: InstructorValidationError[] = [];

    // Name validation
    if (!data.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'Full name is required',
        code: 'NAME_REQUIRED',
        severity: 'error'
      });
    } else if (data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Full name must be at least 2 characters long',
        code: 'NAME_TOO_SHORT',
        severity: 'error'
      });
    } else if (data.name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'Full name must be less than 100 characters',
        code: 'NAME_TOO_LONG',
        severity: 'error'
      });
    }

    // Title validation
    if (!data.title?.trim()) {
      errors.push({
        field: 'title',
        message: 'Professional title is required',
        code: 'TITLE_REQUIRED',
        severity: 'error'
      });
    } else if (data.title.trim().length < 3) {
      errors.push({
        field: 'title',
        message: 'Professional title must be at least 3 characters long',
        code: 'TITLE_TOO_SHORT',
        severity: 'error'
      });
    } else if (data.title.trim().length > 150) {
      errors.push({
        field: 'title',
        message: 'Professional title must be less than 150 characters',
        code: 'TITLE_TOO_LONG',
        severity: 'error'
      });
    }

    // Email validation
    if (!data.email?.trim()) {
      errors.push({
        field: 'email',
        message: 'Email address is required',
        code: 'EMAIL_REQUIRED',
        severity: 'error'
      });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address (e.g., user@example.com)',
        code: 'EMAIL_INVALID',
        severity: 'error'
      });
    }

    // Phone validation (optional but if provided, validate format)
    if (data.phone?.trim() && !this.isValidPhone(data.phone)) {
      errors.push({
        field: 'phone',
        message: 'Please enter a valid phone number (e.g., +1 (555) 123-4567)',
        code: 'PHONE_INVALID',
        severity: 'warning'
      });
    }

    // Bio validation
    if (!data.bio?.trim()) {
      errors.push({
        field: 'bio',
        message: 'Professional biography is required',
        code: 'BIO_REQUIRED',
        severity: 'error'
      });
    } else if (data.bio.trim().length < 50) {
      errors.push({
        field: 'bio',
        message: 'Professional biography must be at least 50 characters long',
        code: 'BIO_TOO_SHORT',
        severity: 'error'
      });
    } else if (data.bio.trim().length > 1000) {
      errors.push({
        field: 'bio',
        message: 'Professional biography must be less than 1000 characters',
        code: 'BIO_TOO_LONG',
        severity: 'error'
      });
    }

    // Image validation
    if (!data.image?.trim()) {
      errors.push({
        field: 'image',
        message: 'Profile image is required',
        code: 'IMAGE_REQUIRED',
        severity: 'error'
      });
    } else if (!this.isValidImageUrl(data.image)) {
      errors.push({
        field: 'image',
        message: 'Please provide a valid image URL or upload an image',
        code: 'IMAGE_INVALID',
        severity: 'error'
      });
    }

    // Experience validation
    if (data.experience < 0) {
      errors.push({
        field: 'experience',
        message: 'Experience cannot be negative',
        code: 'EXPERIENCE_NEGATIVE',
        severity: 'error'
      });
    } else if (data.experience > 50) {
      errors.push({
        field: 'experience',
        message: 'Experience cannot exceed 50 years',
        code: 'EXPERIENCE_TOO_HIGH',
        severity: 'error'
      });
    }

    // Expertise validation
    if (data.expertise.length > 10) {
      errors.push({
        field: 'expertise',
        message: 'You can add up to 10 areas of expertise',
        code: 'EXPERTISE_TOO_MANY',
        severity: 'warning'
      });
    }

    // Social links validation
    if (data.socialLinks.linkedin && !this.isValidUrl(data.socialLinks.linkedin)) {
      errors.push({
        field: 'socialLinks.linkedin',
        message: 'Please enter a valid LinkedIn URL',
        code: 'LINKEDIN_INVALID',
        severity: 'warning'
      });
    }

    if (data.socialLinks.twitter && !this.isValidUrl(data.socialLinks.twitter)) {
      errors.push({
        field: 'socialLinks.twitter',
        message: 'Please enter a valid Twitter URL',
        code: 'TWITTER_INVALID',
        severity: 'warning'
      });
    }

    if (data.socialLinks.website && !this.isValidUrl(data.socialLinks.website)) {
      errors.push({
        field: 'socialLinks.website',
        message: 'Please enter a valid website URL',
        code: 'WEBSITE_INVALID',
        severity: 'warning'
      });
    }

    return errors;
  }

  /**
   * Validates email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates phone number format
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validates URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates image URL format
   */
  private static isValidImageUrl(url: string): boolean {
    if (!url.trim()) return false;

    // Check if it's a valid URL
    if (!this.isValidUrl(url)) return false;

    // Check if it's an image file
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
           lowerUrl.includes('data:image/') ||
           lowerUrl.includes('blob:');
  }

  /**
   * Fetches instructor data by ID
   */
  static async fetchInstructorById(id: string): Promise<Instructor> {
    if (!id?.trim()) {
      throw new InstructorServiceError('Instructor ID is required', 400, 'VALIDATION_ERROR');
    }

    try {
      const response: any = await instructorAPI.getInstructor(id);

      if (!response || !response.id) {
        throw new InstructorServiceError('Instructor not found', 404, 'NOT_FOUND');
      }

      return response as Instructor;
    } catch (error) {
      if (error instanceof InstructorServiceError) {
        throw error;
      }

      console.error('Error fetching instructor:', error);
      throw new InstructorServiceError(
        'Failed to load instructor data. Please try again.',
        500,
        'FETCH_ERROR'
      );
    }
  }

  /**
   * Fetches all instructors
   */
  static async fetchAllInstructors(): Promise<Instructor[]> {
    try {
      const response: any = await instructorAPI.getAllInstructors();

      if (!Array.isArray(response)) {
        console.warn('Expected array of instructors, received:', typeof response);
        return [];
      }

      return (response as any[]).filter((instructor: any) =>
        instructor && instructor.id && instructor.name && instructor.email
      ) as Instructor[];
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw new InstructorServiceError(
        'Failed to load instructors. Please try again.',
        500,
        'FETCH_ERROR'
      );
    }
  }

  /**
   * Creates a new instructor
   */
  static async createInstructor(data: InstructorFormData): Promise<Instructor> {
    // Check permissions first
    this.checkInstructorPermission();

    // Validate input
    const errors = this.validateInstructorData(data);
    if (errors.length > 0) {
      throw new InstructorServiceError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    try {
      const response: any = await instructorAPI.createInstructor(data);

      if (!response || !response.id) {
        throw new InstructorServiceError('Failed to create instructor', 500, 'CREATE_ERROR');
      }

      return response as Instructor;
    } catch (error) {
      if (error instanceof InstructorServiceError) {
        throw error;
      }

      // Handle API error responses
      if (error instanceof Error) {
        const errorMessage = error.message;

        // Check for specific backend error messages
        if (errorMessage.includes('Email is already taken') || errorMessage.includes('already exists')) {
          throw new InstructorServiceError('Email is already taken by another instructor', 400, 'EMAIL_CONFLICT');
        } else if (errorMessage.includes('Invalid email format')) {
          throw new InstructorServiceError('Invalid email format', 400, 'INVALID_EMAIL');
        } else if (errorMessage.includes('Missing required fields')) {
          throw new InstructorServiceError('Please fill in all required fields', 400, 'MISSING_FIELDS');
        } else if (errorMessage.includes('exceed maximum length')) {
          throw new InstructorServiceError('One or more fields are too long', 400, 'FIELD_TOO_LONG');
        } else {
          // Use the actual error message from the backend
          throw new InstructorServiceError(errorMessage, 500, 'CREATE_ERROR');
        }
      }

      console.error('Error creating instructor:', error);
      throw new InstructorServiceError(
        'Failed to create instructor. Please try again.',
        500,
        'CREATE_ERROR'
      );
    }
  }

  /**
   * Updates an existing instructor
   */
  static async updateInstructor(id: string, data: InstructorFormData): Promise<Instructor> {
    // Check permissions first
    this.checkInstructorPermission();

    if (!id?.trim()) {
      throw new InstructorServiceError('Instructor ID is required', 400, 'VALIDATION_ERROR');
    }

    // Validate input
    const errors = this.validateInstructorData(data);
    if (errors.length > 0) {
      throw new InstructorServiceError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    try {
      const response: any = await instructorAPI.updateInstructor(id, data);

      if (!response || !response.id) {
        throw new InstructorServiceError('Failed to update instructor', 500, 'UPDATE_ERROR');
      }

      return response as Instructor;
    } catch (error) {
      if (error instanceof InstructorServiceError) {
        throw error;
      }

      // Handle API error responses
      if (error instanceof Error) {
        const errorMessage = error.message;

        // Check for specific backend error messages
        if (errorMessage.includes('Email is already taken')) {
          throw new InstructorServiceError('Email is already taken by another instructor', 400, 'EMAIL_CONFLICT');
        } else if (errorMessage.includes('Invalid email format')) {
          throw new InstructorServiceError('Invalid email format', 400, 'INVALID_EMAIL');
        } else if (errorMessage.includes('Missing required fields')) {
          throw new InstructorServiceError('Please fill in all required fields', 400, 'MISSING_FIELDS');
        } else if (errorMessage.includes('exceed maximum length')) {
          throw new InstructorServiceError('One or more fields are too long', 400, 'FIELD_TOO_LONG');
        } else if (errorMessage.includes('Instructor not found')) {
          throw new InstructorServiceError('Instructor not found', 404, 'INSTRUCTOR_NOT_FOUND');
        } else if (errorMessage.includes('Invalid instructor ID')) {
          throw new InstructorServiceError('Invalid instructor ID', 400, 'INVALID_ID');
        } else {
          // Use the actual error message from the backend
          throw new InstructorServiceError(errorMessage, 500, 'UPDATE_ERROR');
        }
      }

      console.error('Error updating instructor:', error);
      throw new InstructorServiceError(
        'Failed to update instructor. Please try again.',
        500,
        'UPDATE_ERROR'
      );
    }
  }

  /**
   * Deletes an instructor
   */
  static async deleteInstructor(id: string): Promise<void> {
    // Check permissions first
    this.checkInstructorPermission();

    if (!id?.trim()) {
      throw new InstructorServiceError('Instructor ID is required', 400, 'VALIDATION_ERROR');
    }

    try {
      const response = await instructorAPI.deleteInstructor(id);

      if (!response) {
        throw new InstructorServiceError('Failed to delete instructor', 500, 'DELETE_ERROR');
      }
    } catch (error) {
      if (error instanceof InstructorServiceError) {
        throw error;
      }

      console.error('Error deleting instructor:', error);
      throw new InstructorServiceError(
        'Failed to delete instructor. Please try again.',
        500,
        'DELETE_ERROR'
      );
    }
  }

  /**
   * Converts Instructor to form data
   */
  static instructorToFormData(instructor: Instructor): InstructorFormData {
    return {
      name: instructor.name,
      title: instructor.title,
      email: instructor.email,
      phone: instructor.phone || '',
      bio: instructor.bio,
      image: instructor.image,
      experience: instructor.experience,
      expertise: instructor.expertise || [],
      socialLinks: {
        linkedin: instructor.socialLinks?.linkedin || '',
        twitter: instructor.socialLinks?.twitter || '',
        website: instructor.socialLinks?.website || ''
      }
    };
  }

  /**
   * Creates default form data for new instructor
   */
  static getDefaultFormData(): InstructorFormData {
    return {
      name: '',
      title: '',
      email: '',
      phone: '',
      bio: '',
      image: '',
      experience: 0,
      expertise: [],
      socialLinks: {
        linkedin: '',
        twitter: '',
        website: ''
      }
    };
  }
}
