/**
 * Utility functions for converting images to Base64 format
 * These functions convert image files to Base64 strings for storage in Firestore
 */

export interface ImageConversionResult {
  base64: string;
  mimeType: string;
  size: number;
}

/**
 * Convert a File object to Base64 string
 * @param file - The image file to convert
 * @returns Promise resolving to Base64 data and metadata
 */
export async function fileToBase64(file: File): Promise<ImageConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve({
        base64: result,
        mimeType: file.type,
        size: file.size
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert a Blob object to Base64 string
 * @param blob - The image blob to convert
 * @returns Promise resolving to Base64 data and metadata
 */
export async function blobToBase64(blob: Blob): Promise<ImageConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve({
        base64: result,
        mimeType: blob.type,
        size: blob.size
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read blob'));
    };

    try {
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Validate image file before conversion
 * @param file - The image file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Object with validation result and error message if invalid
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): { isValid: boolean; error?: string } {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

  if (!validImageTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid image type. Supported types: JPEG, PNG, GIF, WebP, SVG`
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Image size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  return { isValid: true };
}

/**
 * Compress image data for storage (basic implementation)
 * Note: This is a simple approach. For production, consider using a library like sharp or compressorjs
 * @param base64Data - The Base64 image data
 * @returns The same data (actual compression would require more complex logic)
 */
export function compressImageData(base64Data: string): string {
  // In a real implementation, you might resize or optimize the image
  // For now, return as-is. Consider using a library like compressorjs for client-side compression
  return base64Data;
}

/**
 * Get file extension from Base64 MIME type
 * @param mimeType - The MIME type of the image
 * @returns File extension (e.g., 'jpg', 'png')
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg'
  };

  return mimeToExt[mimeType] || 'bin';
}
