import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { instructorId } = req.query;

  if (!instructorId || typeof instructorId !== 'string') {
    return res.status(400).json({ error: 'Instructor ID is required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { include_coming_soon } = req.query;
    const includeComingSoon = include_coming_soon === 'true';

    const courses = await FirestoreService.getCoursesByInstructor(instructorId, includeComingSoon);

    return res.status(200).json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error: any) {
    console.error('❌ Instructor courses API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch instructor courses'
    });
  }
}
