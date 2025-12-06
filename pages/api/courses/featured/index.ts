import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get include_coming_soon query parameter (defaults to true)
    const includeComingSoon = req.query.include_coming_soon === 'true' || req.query.include_coming_soon === undefined;
    
    const courses = await FirestoreService.getFeaturedCourses(includeComingSoon);

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
