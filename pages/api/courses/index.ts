import { NextApiRequest, NextApiResponse } from 'next';

// Mock courses data
const MOCK_COURSES = [
  {
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
      }
    ]
  }
];

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const courses = MOCK_COURSES;

      return res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    }

    if (req.method === 'POST') {
      const courseData = req.body;

      if (!courseData.title || !courseData.category) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, category'
        });
      }

      const newCourse = {
        ...courseData,
        id: 'course_' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        courseId: newCourse.id
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Courses API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process courses'
    });
  }
}
