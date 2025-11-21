import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import Button from './Button';
import Image from 'next/image';
import { useFileUpload } from '../../hooks/useFileUpload';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  uploadType: 'avatar' | 'courseThumbnail' | 'courseBanner' | 'lessonThumbnail' | 'certificate';
  label?: string;
  className?: string;
  previewSize?: 'sm' | 'md' | 'lg';
  required?: boolean;
  useBase64?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImage,
  uploadType,
  label,
  className = '',
  previewSize = 'md',
  required = false
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadEndpoint = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
    switch (uploadType) {
      case 'avatar':
        return `${baseUrl}/upload/avatar`;
      case 'courseThumbnail':
        return `${baseUrl}/upload/course-thumbnail`;
      case 'courseBanner':
        return `${baseUrl}/upload/course-banner`;
      case 'lessonThumbnail':
        return `${baseUrl}/upload/lesson-thumbnail`;
      case 'certificate':
        return `${baseUrl}/upload/certificate`;
      default:
        return `${baseUrl}/upload/avatar`;
    }
  };

  // File upload hook
  const {
    isUploading,
    error,
    uploadFile,
    clearError
  } = useFileUpload({
    endpoint: getUploadEndpoint(),
    fieldName: uploadType,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    onSuccess: (data) => {
      onImageUpload(data.url);
    },
    onError: (errorMessage) => {
      setPreview(null);
    }
  });

  const getPreviewSizeClasses = () => {
    switch (previewSize) {
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-16 h-16';
      case 'lg':
        return 'w-24 h-24';
      default:
        return 'w-16 h-16';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file using the hook
    uploadFile(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex items-center space-x-4">
        {/* Preview */}
        {preview && (
          <div className={`relative ${getPreviewSizeClasses()}`}>
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={200}
              className={`w-full h-full object-cover rounded-lg border-2 border-gray-600`}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
            className="w-full flex items-center justify-center space-x-2 py-3"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{preview ? 'Change Image' : 'Upload Image'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-xs text-gray-400">
        Supported formats: JPG, PNG, GIF. Max size: 5MB
      </p>
    </div>
  );
};

export default ImageUpload;
