import { NextApiRequest, NextApiResponse } from 'next';

// Mock courses data
const MOCK_COURSES: { [key: string]: any } = {
  'EIt22gGhCsaLySBtUL4C': {
    id: 'EIt22gGhCsaLySBtUL4C',
    title: 'Master Finance',
    description: 'Learn the fundamentals of personal finance, investment strategies, and wealth management.',
    category_name: 'Finance',
    category: 'Finance',
    thumbnail: '/images/placeholder-course.jpg',
    banner: '/images/placeholder-course.jpg',
    instructor_id: 'instructor_1',
    instructor_name: 'Victor Muniu Njoroge',
    instructor_title: 'Finance Expert',
    instructor_image: '/images/placeholder-avatar.jpg',
    instructor_bio: 'Expert financial advisor with 10+ years of experience',
    instructor_email: 'victor@forwardafrica.com',
    featured: true,
    coming_soon: false,
    total_xp: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lessons: [
      {
        id: 'lesson_1',
        title: 'Introduction to Personal Finance',
        description: 'Learn the basics of personal financial management',
        video_url: '/videos/lesson-1.mp4',
        duration: '15:30',
        order: 1,
        course_id: 'EIt22gGhCsaLySBtUL4C',
        xp_reward: 100,
        thumbnail: '/images/placeholder-course.jpg'
      },
      {
        id: 'lesson_2',
        title: 'Budgeting Strategies',
        description: 'Master the art of budgeting and expense tracking',
        video_url: '/videos/lesson-2.mp4',
        duration: '20:15',
        order: 2,
        course_id: 'EIt22gGhCsaLySBtUL4C',
        xp_reward: 150,
        thumbnail: '/images/placeholder-course.jpg'
      },
      {
        id: 'lesson_3',
        title: 'Investment Basics',
        description: 'Introduction to stocks, bonds, and investment portfolios',
        video_url: '/videos/lesson-3.mp4',
        duration: '25:45',
        order: 3,
        course_id: 'EIt22gGhCsaLySBtUL4C',
        xp_reward: 200,
        thumbnail: '/images/placeholder-course.jpg'
      }
    ]
  }
};

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { courseId } = req.query;

  if (!courseId || typeof courseId !== 'string') {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const course = MOCK_COURSES[courseId];

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: course
      });
    }

    if (req.method === 'PUT') {
      const updateData = req.body;

      if (!MOCK_COURSES[courseId]) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      MOCK_COURSES[courseId] = {
        ...MOCK_COURSES[courseId],
        ...updateData,
        updated_at: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      if (!MOCK_COURSES[courseId]) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      delete MOCK_COURSES[courseId];

      return res.status(200).json({
        success: true,
        message: 'Course deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Course API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process course'
    });
  }
}
