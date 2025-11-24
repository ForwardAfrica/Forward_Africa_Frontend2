import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

function convertToCSV(logs: any[]): string {
  if (logs.length === 0) {
    return 'ID,User ID,User Email,Action,Resource Type,Resource ID,Details,IP Address,User Agent,Created At\n';
  }

  const headers = ['ID', 'User ID', 'User Email', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address', 'User Agent', 'Created At'];
  const rows = logs.map(log => [
    log.id || '',
    log.user_id || '',
    log.user_email || '',
    log.action || '',
    log.resource_type || '',
    log.resource_id || '',
    typeof log.details === 'string' ? log.details : JSON.stringify(log.details || ''),
    log.ip_address || '',
    log.user_agent || '',
    log.created_at || (log.timestamp ? new Date(log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp).toISOString() : '')
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
}

function filterLogs(logs: any[], filters: any): any[] {
  return logs.filter(log => {
    if (filters.startDate) {
      const logDate = new Date(log.created_at || (log.timestamp ? log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp : new Date()));
      const startDate = new Date(filters.startDate);
      if (logDate < startDate) return false;
    }

    if (filters.endDate) {
      const logDate = new Date(log.created_at || (log.timestamp ? log.timestamp.toDate ? log.timestamp.toDate() : log.timestamp : new Date()));
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (logDate > endDate) return false;
    }

    if (filters.action && log.action !== filters.action) {
      return false;
    }

    if (filters.userId && log.user_id !== filters.userId) {
      return false;
    }

    return true;
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { limit = '100', format = 'json', start_date, end_date, action, user_id } = req.query;
      const limitCount = parseInt(limit as string, 10);

      const logs = await FirestoreService.getAuditLogs(limitCount * 2);

      const filters = {
        startDate: start_date ? (start_date as string) : null,
        endDate: end_date ? (end_date as string) : null,
        action: action ? (action as string) : null,
        userId: user_id ? (user_id as string) : null
      };

      const filteredLogs = filterLogs(logs, filters).slice(0, limitCount);

      if (format === 'csv') {
        const csv = convertToCSV(filteredLogs);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
        return res.status(200).send(csv);
      }

      return res.status(200).json({
        success: true,
        data: filteredLogs,
        count: filteredLogs.length,
        total: logs.length
      });
    }

    if (req.method === 'POST') {
      const auditData = req.body;

      if (!auditData.user_id || !auditData.action) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: user_id, action'
        });
      }

      const logId = await FirestoreService.createAuditLog({
        user_id: auditData.user_id,
        user_email: auditData.user_email || '',
        action: auditData.action,
        resource_type: auditData.resource_type || '',
        resource_id: auditData.resource_id || '',
        details: auditData.details || '',
        ip_address: auditData.ip_address || (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket?.remoteAddress || '',
        user_agent: auditData.user_agent || (req.headers['user-agent'] || ''),
        created_at: new Date().toISOString()
      });

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
