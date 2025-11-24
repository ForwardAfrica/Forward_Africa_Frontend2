import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../../../../backend/lib/firestoreService';

// Import audit service and JWT helper
const AuditService = require('../../../../../../backend/lib/auditService');
const JWTHelper = require('../../../../../../backend/lib/jwtHelper');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, courseId, lessonId } = req.query;

  if (!userId || typeof userId !== 'string' || !courseId || typeof courseId !== 'string' || !lessonId || typeof lessonId !== 'string') {
    return res.status(400).json({ error: 'User ID, Course ID, and Lesson ID are required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await FirestoreService.markLessonComplete(userId, courseId, lessonId);

    // Log lesson completion
    try {
      const userInfo = extractUserFromRequest(req);
      if (userInfo) {
        const ipAddress = AuditService.getClientIp(req);
        const userAgent = AuditService.getUserAgent(req);
        await AuditService.logLessonAction(
          'complete',
          userId,
          userInfo.email,
          lessonId,
          courseId,
          {},
          ipAddress,
          userAgent
        );
      }
    } catch (auditError) {
      console.error('⚠️ Failed to log lesson completion audit event:', auditError);
    }

    return res.status(200).json({
      success: true,
      message: 'Lesson marked as complete'
    });
  } catch (error: any) {
    console.error('❌ Mark lesson complete API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark lesson as complete'
    });
  }
}
