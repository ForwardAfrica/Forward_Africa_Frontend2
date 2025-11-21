import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const notifications = await FirestoreService.getUserNotifications(userId);

      return res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    }

    if (req.method === 'POST') {
      const { notificationId } = req.body;

      if (!notificationId) {
        return res.status(400).json({
          success: false,
          error: 'Notification ID is required'
        });
      }

      await FirestoreService.markNotificationAsRead(userId, notificationId);

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Notifications API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process notifications'
    });
  }
}
