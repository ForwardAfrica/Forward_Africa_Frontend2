import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

// Import audit service and JWT helper
const AuditService = require('../../../backend/lib/auditService');
const JWTHelper = require('../../../backend/lib/jwtHelper');

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
        const userInfo = JWTHelper.extractUserFromRequest(req);
        if (userInfo) {
          const ipAddress = JWTHelper.getClientIp(req);
          const userAgent = JWTHelper.getUserAgent(req);
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
        const userInfo = JWTHelper.extractUserFromRequest(req);
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
