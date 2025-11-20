import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { limit = '100' } = req.query;
      const limitCount = parseInt(limit as string, 10);

      const logs = await FirestoreService.getAuditLogs(limitCount);

      return res.status(200).json({
        success: true,
        data: logs,
        count: logs.length
      });
    }

    if (req.method === 'POST') {
      const auditData = req.body;

      if (!auditData.user_id || !auditData.user_email || !auditData.action) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: user_id, user_email, action'
        });
      }

      const logId = await FirestoreService.createAuditLog(auditData);

      return res.status(201).json({
        success: true,
        message: 'Audit log created successfully',
        logId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Audit logs API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process audit logs'
    });
  }
}
