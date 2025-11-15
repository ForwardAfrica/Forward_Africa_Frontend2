import { useState } from 'react';
import { uploadInstructorImage, uploadAvatarImage, uploadCourseThumbnail, uploadCourseBanner } from '../lib/firebaseStorage';
import { validateFile } from '../utils/fileValidator';
import { handleUploadError } from '../utils/errorHandler';

export interface FirebaseUploadOptions {
  uploadType: 'avatar' | 'courseThumbnail' | 'courseBanner' | 'lessonThumbnail' | 'certificate' | 'instructorImage';
  entityId: string;
  courseId?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export interface FirebaseUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: string | null;
}

export const useFirebaseImageUpload = (options: FirebaseUploadOptions) => {
  const [state, setState] = useState<FirebaseUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: null
  });

  const uploadFile = async (file: File) => {
    // Validate file
    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    });

    if (!validation.isValid) {
      const errorMsg = validation.error || 'Invalid file';
      setState(prev => ({ ...prev, error: errorMsg }));
      options.onError?.(errorMsg);
      return;
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      error: null,
      success: null,
      progress: 0
    }));

    try {
      console.log('📤 Uploading file to Firebase Storage:', {
        uploadType: options.uploadType,
        entityId: options.entityId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      let downloadUrl: string;

      switch (options.uploadType) {
        case 'instructorImage':
          downloadUrl = await uploadInstructorImage(file, options.entityId);
          break;

        case 'avatar':
          downloadUrl = await uploadAvatarImage(file, options.entityId);
          break;

        case 'courseThumbnail':
          downloadUrl = await uploadCourseThumbnail(file, options.entityId);
          break;

        case 'courseBanner':
          downloadUrl = await uploadCourseBanner(file, options.entityId);
          break;

        case 'lessonThumbnail':
          if (!options.courseId) {
            throw new Error('courseId is required for lesson thumbnails');
          }
          // For now, we'll skip lesson thumbnails as they require a course ID
          throw new Error('Lesson thumbnail upload not yet implemented in this context');

        case 'certificate':
          // For now, we'll skip certificate uploads as they may need different handling
          throw new Error('Certificate upload not yet implemented in this context');

        default:
          throw new Error(`Unknown upload type: ${options.uploadType}`);
      }

      console.log('✅ Upload successful, URL:', downloadUrl);

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        success: 'Upload completed successfully'
      }));

      options.onSuccess?.(downloadUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }));

      options.onError?.(errorMessage);
      console.error('❌ Upload error:', errorMessage);
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const clearSuccess = () => {
    setState(prev => ({ ...prev, success: null }));
  };

  return {
    ...state,
    uploadFile,
    clearError,
    clearSuccess
  };
};
