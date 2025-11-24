import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

// Import audit service and JWT helper
const AuditService = require('../../../backend/lib/auditService');
const JWTHelper = require('../../../backend/lib/jwtHelper');

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { limit = '20', lastDocId } = req.query;
      const limitCount = parseInt(limit as string, 10);
      const lastDocIdValue = typeof lastDocId === 'string' ? lastDocId : undefined;

      const courses = await FirestoreService.getCourses(limitCount, lastDocIdValue as any);

      return res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    }

    if (req.method === 'POST') {
      const courseData = req.body;

      if (!courseData.title || !courseData.category) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, category'
        });
      }

      const courseId = await FirestoreService.createCourse(courseData);

      // Log course creation
      try {
        const userInfo = JWTHelper.extractUserFromRequest(req);
        if (userInfo) {
          const ipAddress = JWTHelper.getClientIp(req);
          const userAgent = JWTHelper.getUserAgent(req);
          await AuditService.logCourseAction(
            'create',
            userInfo.userId,
            userInfo.email,
            courseId,
            courseData.title,
            { category: courseData.category },
            ipAddress,
            userAgent
          );
        }
      } catch (auditError) {
        console.error('⚠️ Failed to log course creation audit event:', auditError);
      }

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        courseId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Courses API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process courses'
    });
  }
}
