import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear auth_token cookie by setting it to an empty value with past expiration
  // Match the cookie format used in login (SameSite=Lax, no HttpOnly flag for JavaScript accessibility)

  // Check if request is HTTPS (set Secure flag if so)
  const isHttps = req.headers['x-forwarded-proto'] === 'https' ||
                  req.headers['x-proto'] === 'https' ||
                  req.connection.encrypted ||
                  process.env.NODE_ENV === 'production';

  const cookieOptions = [
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0', // Immediately expires the cookie
    isHttps ? 'Secure' : ''
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', `auth_token=; ${cookieOptions}`);

  return res.status(200).json({
    message: 'Logged out successfully'
  });
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
