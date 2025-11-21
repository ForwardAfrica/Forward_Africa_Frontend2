import { NextApiRequest, NextApiResponse } from 'next';

// Mock featured courses
const MOCK_FEATURED_COURSES = [
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const courses = MOCK_FEATURED_COURSES;

    return res.status(200).json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error: any) {
    console.error('❌ Featured courses API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch featured courses'
    });
  }
}
