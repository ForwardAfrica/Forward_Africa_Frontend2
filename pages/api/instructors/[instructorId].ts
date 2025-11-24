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

      // Get existing instructor to log what changed
      const existingInstructor = await FirestoreService.getInstructorById(instructorId);

      await FirestoreService.updateInstructor(instructorId, updateData);

      // Log instructor update
      try {
        const userInfo = extractUserFromRequest(req);
        if (userInfo) {
          const ipAddress = AuditService.getClientIp(req);
          const userAgent = AuditService.getUserAgent(req);
          await AuditService.logInstructorAction(
            'update',
            userInfo.userId,
            userInfo.email,
            instructorId,
            updateData.name || existingInstructor?.name || 'Unknown',
            { updated_fields: Object.keys(updateData) },
            ipAddress,
            userAgent
          );
        }
      } catch (auditError) {
        console.error('⚠️ Failed to log instructor update audit event:', auditError);
      }

      return res.status(200).json({
        success: true,
        message: 'Instructor updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Get instructor info before deletion for audit log
      const instructorToDelete = await FirestoreService.getInstructorById(instructorId);

      await FirestoreService.deleteInstructor(instructorId);

      // Log instructor deletion
      try {
        const userInfo = extractUserFromRequest(req);
        if (userInfo) {
          const ipAddress = AuditService.getClientIp(req);
          const userAgent = AuditService.getUserAgent(req);
          await AuditService.logInstructorAction(
            'delete',
            userInfo.userId,
            userInfo.email,
            instructorId,
            instructorToDelete?.name || 'Unknown',
            {},
            ipAddress,
            userAgent
          );
        }
      } catch (auditError) {
        console.error('⚠️ Failed to log instructor deletion audit event:', auditError);
      }

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
