import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CourseCard from '../components/ui/CourseCard';
import { courseAPI, categoryAPI } from '../lib/api';
import { Course, Category } from '../types';
import Layout from '../components/layout/Layout';

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { categoryId } = router.query;
  const [courses, setCourses] = useState<Course[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (categoryId && typeof categoryId === 'string') {
        setLoading(true);
        setError(null);
        try {
          // Get category details
          const categoryData: any = await categoryAPI.getCategory(categoryId);
          if (categoryData && typeof categoryData === 'object' && 'id' in categoryData && 'name' in categoryData) {
            setCategory(categoryData as Category);
          } else {
            setCategory(null);
          }

          // Get courses for this category
          const coursesData: any = await courseAPI.getCoursesByCategory(categoryId);
          const coursesArray: Course[] = Array.isArray(coursesData) ? (coursesData as Course[]) : [];
          setCourses(coursesArray);
        } catch (error) {
          console.error('Failed to load category data:', error);
          setError('Failed to load category data. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCategoryData();
  }, [categoryId]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <span className="ml-4 text-white text-lg">Loading category...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <h1 className="text-white text-3xl font-bold mb-6">Error Loading Category</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
          >
            Return to Courses
          </button>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <h1 className="text-white text-3xl font-bold mb-6">Category Not Found</h1>
          <button
            onClick={() => router.push('/courses')}
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
          >
            Return to Courses
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-white text-4xl font-bold mb-4">{category.name}</h1>
          <p className="text-gray-300 max-w-3xl">
            Explore our collection of {category.name.toLowerCase()} classes taught by world-renowned experts.
            Master new skills and unlock your potential with in-depth lessons and hands-on projects.
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 card-grid-container">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-white text-2xl font-medium mb-4">No courses available in this category yet</h2>
            <p className="text-gray-400 text-center max-w-md mb-8">
              We're working on bringing you amazing content in this category.
              Check back soon for new classes!
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Explore Other Categories
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
