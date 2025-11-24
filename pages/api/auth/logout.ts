import { NextApiRequest, NextApiResponse } from 'next';

// Import audit service for logging
const AuditService = require('../../../backend/lib/auditService');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user info from request body or auth header
    const { userId, userEmail } = req.body;

    // Log logout attempt
    if (userId && userEmail) {
      try {
        const ipAddress = AuditService.getClientIp(req);
        const userAgent = AuditService.getUserAgent(req);
        await AuditService.logLogout(userId, userEmail, ipAddress, userAgent);
      } catch (auditError) {
        console.error('⚠️ Failed to log logout audit event:', auditError);
        // Don't fail the logout if audit logging fails
      }
    }

    // Clear app_user cookie by setting it to an empty value with past expiration
    // Match the cookie format used in login (SameSite=Lax, no HttpOnly flag, no Domain)
    const isProduction = process.env.NODE_ENV === 'production' ||
                         req.headers.host?.includes('fly.dev') ||
                         req.headers['x-forwarded-proto'] === 'https';

    const cookieOptions = [
      'Path=/',
      isProduction ? "SameSite=None" : "SameSite=Lax",
      'Max-Age=0', // Immediately expires the cookie
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', `app_user=; ${cookieOptions}`);

    return res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      error: 'Logout failed. Please try again.'
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
