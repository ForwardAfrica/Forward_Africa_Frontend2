import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Clear auth_token cookie by setting it to an empty value with past expiration
  // Match the cookie format used in login (SameSite=Lax, no HttpOnly flag, Secure flag)
  const cookieOptions = [
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0', // Immediately expires the cookie
    'Secure' // Match the login endpoint
  ].join('; ');

  res.setHeader('Set-Cookie', `auth_token=; ${cookieOptions}`);

  return res.status(200).json({
    message: 'Logged out successfully'
  });
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
