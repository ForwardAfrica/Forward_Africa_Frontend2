import {
  uploadInstructorImage,
  uploadAvatarImage,
  uploadCourseThumbnail,
  uploadCourseBanner,
  uploadLessonThumbnail,
  uploadCertificateImage
} from './firebaseStorage';

export interface UploadRequest {
  file: File;
  uploadType: 'avatar' | 'courseThumbnail' | 'courseBanner' | 'lessonThumbnail' | 'certificate' | 'instructorImage';
  entityId: string;
  courseId?: string;
}

/**
 * Upload handler that routes to appropriate Firebase Storage upload function
 */
export async function uploadFileToFirebase(request: UploadRequest): Promise<string> {
  const { file, uploadType, entityId, courseId } = request;

  try {
    switch (uploadType) {
      case 'avatar':
        return await uploadAvatarImage(file, entityId);

      case 'courseThumbnail':
        return await uploadCourseThumbnail(file, entityId);

      case 'courseBanner':
        return await uploadCourseBanner(file, entityId);

      case 'lessonThumbnail':
        if (!courseId) {
          throw new Error('courseId is required for lesson thumbnails');
        }
        return await uploadLessonThumbnail(file, courseId, entityId);

      case 'certificate':
        return await uploadCertificateImage(file, entityId);

      case 'instructorImage':
        return await uploadInstructorImage(file, entityId);

      default:
        throw new Error(`Unknown upload type: ${uploadType}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    console.error('Upload error:', errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Create a Firebase Storage API endpoint handler for Next.js API routes
 * This allows the ImageUpload component to work without modifications
 */
export async function handleFirebaseUpload(
  req: any,
  uploadType: 'avatar' | 'courseThumbnail' | 'courseBanner' | 'lessonThumbnail' | 'certificate' | 'instructorImage'
): Promise<{ url: string }> {
  // This is typically called from Next.js API routes
  // For now, we'll just provide the interface - actual use in API routes would extract the file and entityId
  throw new Error('Use uploadFileToFirebase directly instead');
}
