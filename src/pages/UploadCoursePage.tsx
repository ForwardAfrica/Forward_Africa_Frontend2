import React, { useEffect, useState } from 'react';
import { Upload, ArrowLeft, Plus, X, Star, User, Info, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate, useSearchParams } from '../lib/router';
import { categoryAPI } from '../lib/api';
import { Instructor, Category } from '../types';
import ImageUpload from '../components/ui/ImageUpload';
import Layout from '../components/layout/Layout';
import { fileToBase64, validateImageFile } from '../utils/imageConverter';

interface LessonForm {
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
}

interface SuccessMessage {
  show: boolean;
  message: string;
}

interface ErrorMessage {
  show: boolean;
  message: string;
}

const UploadCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCourseId = searchParams.get('edit');
  const isEditing = !!editCourseId;

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [isComingSoon, setIsComingSoon] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [useInstructor, setUseInstructor] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [banner, setBanner] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [lessons, setLessons] = useState<LessonForm[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Progress and status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage>({ show: false, message: '' });
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>({ show: false, message: '' });

  // Load instructors and categories from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load instructors from API
        const instructorsResponse = await fetch('/api/instructors');
        if (instructorsResponse.ok) {
          const instructorsData = await instructorsResponse.json();
          setInstructors(Array.isArray(instructorsData) ? instructorsData : instructorsData.data || []);
        } else {
          console.error('Failed to load instructors');
        }

        // Load categories from API
        const categoriesData: any = await categoryAPI.getAllCategories();
        const categoriesArr: Category[] = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
        setAvailableCategories(categoriesArr);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Load existing course data if editing
  useEffect(() => {
    if (isEditing && editCourseId) {
      const loadCourse = async () => {
        try {
          const response = await fetch(`/api/courses/${editCourseId}`);
          if (response.ok) {
            const courseData = await response.json();
            const existingCourse = courseData.data || courseData;
            console.log('Loading existing course for editing:', existingCourse);

            setTitle(existingCourse.title || '');
            setDescription(existingCourse.description || '');
            setCategory(existingCourse.category || existingCourse.category_id || '');
            setThumbnail(existingCourse.thumbnail || '');
            setBanner(existingCourse.banner || '');
            setIsComingSoon(existingCourse.coming_soon === 1 || existingCourse.coming_soon === true);
            setIsFeatured(existingCourse.featured || false);
            setReleaseDate(existingCourse.release_date || '');

            // Check if course has an instructor
            if (existingCourse.instructor_id) {
              setUseInstructor(true);
              setSelectedInstructorId(existingCourse.instructor_id);
            }
          } else {
            console.error('Failed to load course for editing');
            setErrorMessage({ show: true, message: 'Failed to load course for editing' });
          }
        } catch (error) {
          console.error('Error loading course for editing:', error);
          setErrorMessage({ show: true, message: 'Error loading course for editing' });
        }
      };
      loadCourse();
    }
  }, [isEditing, editCourseId]);

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          const categoriesArr: Category[] = Array.isArray(data) ? data : (data?.data || []);
          setAvailableCategories(categoriesArr);
        } else {
          console.error('Failed to load categories');
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Validation function
  const validateForm = (): string[] => {
    const errors: string[] = [];

    // Course validation
    if (!title.trim()) errors.push('Course title is required');
    if (!description.trim()) errors.push('Course description is required');
    if (!category) errors.push('Course category is required');
    if (!thumbnail) errors.push('Course thumbnail is required');
    if (!banner) errors.push('Course banner is required');

    // Lessons validation
    if (lessons.length === 0) {
      errors.push('At least one lesson is required');
    } else {
      lessons.forEach((lesson, index) => {
        if (!lesson.title.trim()) {
          errors.push(`Lesson ${index + 1}: Title is required`);
        }
        if (!lesson.description.trim()) {
          errors.push(`Lesson ${index + 1}: Description is required`);
        }
        if (!lesson.videoUrl.trim()) {
          errors.push(`Lesson ${index + 1}: Video URL is required`);
        }
        if (!lesson.thumbnail.trim()) {
          errors.push(`Lesson ${index + 1}: Thumbnail is required`);
        }
      });
    }

    return errors;
  };

  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        title: '',
        description: '',
        thumbnail: '',
        videoUrl: ''
      }
    ]);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const updateLesson = (index: number, field: keyof LessonForm, value: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = {
      ...updatedLessons[index],
      [field]: value
    };
    setLessons(updatedLessons);
  };

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const newCategory = {
          id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
          name: newCategoryName.trim()
        };

        // Create category via API
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory)
        });

        if (response.ok) {
          setAvailableCategories(prev => [...prev, newCategory]);
          setCategory(newCategory.id);
          setNewCategoryName('');
          setShowCreateCategory(false);
        } else {
          console.error('Failed to create category');
          setErrorMessage({ show: true, message: 'Failed to create category' });
        }
      } catch (error) {
        console.error('Error creating category:', error);
        setErrorMessage({ show: true, message: 'Error creating category' });
      }
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setThumbnail('');
    setBanner('');
    setReleaseDate('');
    setLessons([]);
    setIsComingSoon(false);
    setIsFeatured(false);
    setUseInstructor(false);
    setSelectedInstructorId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setValidationErrors([]);
    setErrorMessage({ show: false, message: '' });
    setSuccessMessage({ show: false, message: '' });

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setErrorMessage({ show: true, message: 'Please fix the validation errors below' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Prepare course data
      setCurrentStep('Preparing course data...');
      setUploadProgress(10);

      const instructorId = useInstructor && selectedInstructorId ? selectedInstructorId : 'default-instructor';

      const courseData = {
        title,
        description,
        instructor_id: instructorId,
        category,
        thumbnail,
        banner,
        featured: isFeatured,
        coming_soon: isComingSoon,
        release_date: isComingSoon ? releaseDate : null,
        total_xp: lessons.length * 100,
        lessons: lessons.map((lesson, index) => ({
          title: lesson.title,
          description: lesson.description,
          thumbnail: lesson.thumbnail,
          video_url: lesson.videoUrl,
          duration: '10:00',
          xp_points: 100,
          order_index: index
        }))
      };

      console.log('Course data prepared:', courseData);

      // Step 2: Create or update course
      setCurrentStep(isEditing ? 'Updating course in Firestore...' : 'Creating course in Firestore...');
      setUploadProgress(50);

      const url = isEditing && editCourseId 
        ? `/api/courses/${editCourseId}` 
        : '/api/courses';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} course`);
      }

      const result = await response.json();
      console.log('Course saved successfully:', result);

      setUploadProgress(100);
      setCurrentStep(`Course ${isEditing ? 'updated' : 'created'} successfully!`);

      // Show success message
      const successMsg = isEditing ? 'Course updated successfully!' : 'Course created successfully!';
      setSuccessMessage({ show: true, message: successMsg });

      // Clear form
      clearForm();

      // Navigate back to admin after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error) {
      console.error('Error processing course:', error);
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage({ show: true, message: errorMsg });
      setCurrentStep('');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white">
              {isEditing ? 'Edit Course' : 'Upload New Course'}
            </h1>
          </div>

          {/* Success Message */}
          {successMessage.show && (
            <div className="mb-6 bg-green-900 border border-green-700 rounded-lg p-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-green-200 font-medium">{successMessage.message}</h3>
                <p className="text-green-300 text-sm mt-1">Redirecting to admin dashboard...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage.show && (
            <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-200 font-medium">Error</h3>
                <p className="text-red-300 text-sm mt-1">{errorMessage.message}</p>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isSubmitting && (
            <div className="mb-6 bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{currentStep}</span>
                <span className="text-gray-300">{uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4">
              <h3 className="text-red-200 font-medium mb-2">Please fix the following errors:</h3>
              <ul className="text-red-300 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter course description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <div className="flex space-x-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateCategory(true)}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                </div>
              </div>

              {/* Instructor Selection */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="useInstructor"
                    checked={useInstructor}
                    onChange={(e) => {
                      setUseInstructor(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedInstructorId('');
                      }
                    }}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="useInstructor" className="ml-2 text-gray-300 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Assign to Instructor
                  </label>
                </div>

                {useInstructor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Instructor
                    </label>
                    {instructors.length > 0 ? (
                      <select
                        value={selectedInstructorId}
                        onChange={(e) => setSelectedInstructorId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        required={useInstructor}
                      >
                        <option value="">Choose an instructor</option>
                        {instructors.map(instructor => (
                          <option key={instructor.id} value={instructor.id}>
                            {(instructor as any).name || (instructor as any).title} 
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-gray-700 border border-gray-600 rounded-md p-4">
                        <p className="text-gray-400 text-sm mb-3">
                          No instructors available. You need to add instructors first.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/admin/add-instructor')}
                          className="flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Instructor
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Create Category Modal */}
              {showCreateCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-xl font-semibold text-white mb-4">Create New Category</h3>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                    />
                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateCategory(false);
                          setNewCategoryName('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleCreateCategory}
                        className="flex-1"
                      >
                        Create
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Course Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  onImageUpload={setThumbnail}
                  currentImage={thumbnail}
                  uploadType="courseThumbnail"
                  label="Course Thumbnail"
                  previewSize="sm"
                  required
                  useBase64={true}
                />

                <ImageUpload
                  onImageUpload={setBanner}
                  currentImage={banner}
                  uploadType="courseBanner"
                  label="Course Banner"
                  previewSize="sm"
                  required
                  useBase64={true}
                />
              </div>

              {/* Course Settings */}
              <div className="space-y-4">
                {/* Coming Soon Settings */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="comingSoon"
                    checked={isComingSoon}
                    onChange={(e) => setIsComingSoon(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="comingSoon" className="ml-2 text-gray-300">
                    Mark as "Coming Soon"
                  </label>
                </div>

                {/* Featured Course Settings */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="featured" className="ml-2 text-gray-300 flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    Add to Featured Classes
                  </label>
                </div>
              </div>

              {isComingSoon && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expected Release Date
                  </label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              )}

              {/* Lessons Section */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Lessons</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLesson}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>

                <div className="space-y-6">
                  {lessons.map((lesson, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-6 relative">
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(index, 'title', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter lesson title"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={lesson.description}
                            onChange={(e) => updateLesson(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Enter lesson description"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ImageUpload
                            onImageUpload={(url) => updateLesson(index, 'thumbnail', url)}
                            currentImage={lesson.thumbnail}
                            uploadType="lessonThumbnail"
                            label="Lesson Thumbnail"
                            previewSize="sm"
                            required
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                              Video URL
                              <div className="ml-2 group relative">
                                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  Supports YouTube URLs and direct video files (MP4, WebM, etc.)
                                </div>
                              </div>
                            </label>
                            <input
                              type="url"
                              value={lesson.videoUrl}
                              onChange={(e) => updateLesson(index, 'videoUrl', e.target.value)}
                              className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="Enter YouTube URL or direct video file URL"
                              required
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              YouTube URLs will be automatically embedded. Direct video files (MP4, WebM) will use the custom player.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || lessons.length === 0}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditing ? 'Update Course' : 'Create Course'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadCoursePage;
