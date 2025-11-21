import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const achievements = await FirestoreService.getUserAchievements(userId);

    return res.status(200).json({
      success: true,
      data: achievements,
      count: achievements.length
    });
  } catch (error: any) {
    console.error('❌ Achievements API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch achievements'
    });
  }
}
