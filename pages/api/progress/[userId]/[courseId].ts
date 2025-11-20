import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, courseId } = req.query;

  if (!userId || typeof userId !== 'string' || !courseId || typeof courseId !== 'string') {
    return res.status(400).json({ error: 'User ID and Course ID are required' });
  }

  try {
    if (req.method === 'GET') {
      const progress = await FirestoreService.getUserProgress(userId, courseId);

      return res.status(200).json({
        success: true,
        data: progress,
        count: progress.length
      });
    }

    if (req.method === 'POST') {
      const { lessonId, progressData } = req.body;

      if (!lessonId) {
        return res.status(400).json({
          success: false,
          error: 'Lesson ID is required'
        });
      }

      await FirestoreService.updateUserProgress(userId, courseId, lessonId, progressData);

      return res.status(200).json({
        success: true,
        message: 'Progress updated successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ User progress API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process user progress'
    });
  }
}
