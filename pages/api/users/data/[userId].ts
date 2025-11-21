import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const userData = await FirestoreService.getUserData(userId);

      if (!userData) {
        return res.status(404).json({
          success: false,
          error: 'User data not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: userData
      });
    }

    if (req.method === 'POST') {
      const userData = req.body;

      await FirestoreService.createUserData(userId, userData);

      return res.status(201).json({
        success: true,
        message: 'User data created successfully'
      });
    }

    if (req.method === 'PUT') {
      const updateData = req.body;

      await FirestoreService.updateUserData(userId, updateData);

      return res.status(200).json({
        success: true,
        message: 'User data updated successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ User data API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process user data'
    });
  }
}
