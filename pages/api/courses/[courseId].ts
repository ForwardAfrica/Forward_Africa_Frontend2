import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

// Import audit service
const AuditService = require('../../../backend/lib/auditService');

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

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } }
};

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

      // Get existing course to log what changed
      const existingCourse = await FirestoreService.getCourseById(courseId);

      await FirestoreService.updateCourse(courseId, updateData);

      // Log course update
      try {
        const userInfo = extractUserFromRequest(req);
        if (userInfo) {
          const ipAddress = AuditService.getClientIp(req);
          const userAgent = AuditService.getUserAgent(req);
          await AuditService.logCourseAction(
            'update',
            userInfo.userId,
            userInfo.email,
            courseId,
            updateData.title || existingCourse?.title || 'Unknown',
            { updated_fields: Object.keys(updateData) },
            ipAddress,
            userAgent
          );
        }
      } catch (auditError) {
        console.error('⚠️ Failed to log course update audit event:', auditError);
      }

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Get course info before deletion for audit log
      const courseToDelete = await FirestoreService.getCourseById(courseId);

      await FirestoreService.deleteCourse(courseId);

      // Log course deletion
      try {
        const userInfo = extractUserFromRequest(req);
        if (userInfo) {
          const ipAddress = AuditService.getClientIp(req);
          const userAgent = AuditService.getUserAgent(req);
          await AuditService.logCourseAction(
            'delete',
            userInfo.userId,
            userInfo.email,
            courseId,
            courseToDelete?.title || 'Unknown',
            {},
            ipAddress,
            userAgent
          );
        }
      } catch (auditError) {
        console.error('⚠️ Failed to log course deletion audit event:', auditError);
      }

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
