import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { instructorId } = req.query;

  if (!instructorId || typeof instructorId !== 'string') {
    return res.status(400).json({ error: 'Instructor ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const instructor = await FirestoreService.getInstructorById(instructorId);

      if (!instructor) {
        return res.status(404).json({
          success: false,
          error: 'Instructor not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: instructor
      });
    }

    if (req.method === 'PUT') {
      const updateData = req.body;

      await FirestoreService.updateInstructor(instructorId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Instructor updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      await FirestoreService.deleteInstructor(instructorId);

      return res.status(200).json({
        success: true,
        message: 'Instructor deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Instructor API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process instructor'
    });
  }
}
