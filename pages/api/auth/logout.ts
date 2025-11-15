import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
