import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../../../../backend/lib/firestoreService';

// Import audit service
const AuditService = require('../../../../../../backend/lib/auditService');

// Helper to extract user info from JWT in cookies
function extractUserFromRequest(req: NextApiRequest): { userId: string; email: string } | null {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get from cookies
      const cookies = req.headers.cookie || '';
      const match = cookies.match(/app_user=([^;]+)/);
      token = match ? match[1] : null;
    }

    if (!token) return null;

    // Decode JWT (this is a simple decode, not verification)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return {
      userId: payload.userId,
      email: payload.email
    };
  } catch (error) {
    console.error('Failed to extract user from request:', error);
    return null;
  }
}

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
