import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

const initFirebaseAdmin = () => {
  if (!admin.apps.length) {
    const serviceAccountKey = process.env.SERVICE_ACCOUNT;
    if (!serviceAccountKey) {
      throw new Error('SERVICE_ACCOUNT environment variable is not configured');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (err) {
      console.error('❌ Failed to parse SERVICE_ACCOUNT JSON:', err);
      throw new Error('SERVICE_ACCOUNT must be a valid JSON string');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin SDK initialized in refresh endpoint');
  }
};

class JWTManager {
  private static JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  private static JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 3600;

  static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  static base64UrlDecode(str: string): string {
    str += new Array(5 - str.length % 4).join('=');
    return Buffer.from(
      str.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf8');
  }

  static generateSignature(message: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.JWT_SECRET)
      .update(message)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  static verifyToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [headerEncoded, payloadEncoded, signature] = parts;
      const message = `${headerEncoded}.${payloadEncoded}`;

      const expectedSignature = this.generateSignature(message);
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      const payloadJson = this.base64UrlDecode(payloadEncoded);
      const payload = JSON.parse(payloadJson);

      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new Error(`Token verification failed: ${(error as any).message}`);
    }
  }

  static createToken(payload: any): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + this.JWT_EXPIRES_IN;

    const tokenPayload = { ...payload, iat, exp };

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const message = `${headerEncoded}.${payloadEncoded}`;
    const signature = this.generateSignature(message);

    return `${message}.${signature}`;
  }

  static getTokenExpiry(): number {
    return this.JWT_EXPIRES_IN * 1000;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initFirebaseAdmin();

    // Get token from cookie only (secure approach)
    const token = req.cookies.app_user;

    if (!token) {
      return res.status(401).json({ error: 'No token provided - authentication required' });
    }

    // Verify and decode the token
    let payload;
    try {
      payload = JWTManager.verifyToken(token);
    } catch (error: any) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get updated user data from Firebase
    const userRecord = await admin.auth().getUser(payload.userId);

    // Get user's current role
    let userRole = 'user';
    let userData: any = {};

    try {
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (userDoc.exists) {
        const data = userDoc.data();
        userRole = data?.role || 'user';
        userData = data || {};
      }
    } catch (error) {
      console.warn('Could not fetch user data:', error);
    }

    // Create new JWT token
    const tokenPayload = {
      userId: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      role: userRole
    };

    const newToken = JWTManager.createToken(tokenPayload);
    const tokenExpiryMs = JWTManager.getTokenExpiry();

    // Set new token in cookie (match login endpoint configuration)
    const maxAge = Math.floor(tokenExpiryMs / 1000);
    const isProduction = process.env.NODE_ENV === 'production' ||
                         req.headers.host?.includes('fly.dev') ||
                         req.headers['x-forwarded-proto'] === 'https';

    const cookieString = [
      `app_user=${newToken}`,
      'Path=/',
      isProduction ? "SameSite=None" : "SameSite=Lax",
      `Max-Age=${maxAge}`,
      isProduction ? 'Secure' : ''
      // CRITICAL: Omitting Domain and HttpOnly - Domain prevents JS access, HttpOnly blocks reading
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieString);

    const responseUser = {
      id: userRecord.uid,
      email: userRecord.email,
      full_name: userRecord.displayName || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      role: userRole,
      ...userData
    };

    return res.status(200).json({
      message: 'Token refreshed',
      user: responseUser,
      token: newToken
    });

  } catch (error: any) {
    console.error('❌ Token refresh error:', error);
    return res.status(500).json({ error: 'Token refresh failed' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
