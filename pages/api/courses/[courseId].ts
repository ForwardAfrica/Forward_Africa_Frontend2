import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { courseId } = req.query;

  if (!courseId || typeof courseId !== 'string') {
    return res.status(400).json({ error: 'Course ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const course = await FirestoreService.getCourseById(courseId);

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

      await FirestoreService.updateCourse(courseId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      await FirestoreService.deleteCourse(courseId);

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
