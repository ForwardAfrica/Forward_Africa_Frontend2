import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { category } = req.query;

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category is required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const courses = await FirestoreService.getCoursesByCategory(category);

    return res.status(200).json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error: any) {
    console.error('❌ Courses by category API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch courses by category'
    });
  }
}
