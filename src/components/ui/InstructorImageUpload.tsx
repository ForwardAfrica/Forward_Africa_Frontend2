import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import Button from './Button';
import Image from 'next/image';
import { validateFile } from '../../utils/fileValidator';

interface InstructorImageUploadProps {
  onImageUpload: (base64: string) => void;
  currentImage?: string;
  instructorId?: string;
  label?: string;
  className?: string;
  required?: boolean;
}

const InstructorImageUpload: React.FC<InstructorImageUploadProps> = ({
  onImageUpload,
  currentImage,
  label = 'Profile Image',
  className = '',
  required = false
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    // Validate file
    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    });

    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Convert to Base64
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setPreview(base64String);
        onImageUpload(base64String);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    setError(null);
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
          <div className="relative w-20 h-20">
            <Image
              src={preview}
              alt="Instructor preview"
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-lg border-2 border-gray-600"
              priority={false}
            />
            {!isProcessing && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isProcessing}
            className="w-full flex items-center justify-center space-x-2 py-3"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
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
        <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Help Text */}
      <p className="text-xs text-gray-400">
        Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB. Images are stored as Base64 in the database.
      </p>
    </div>
  );
};

export default InstructorImageUpload;
