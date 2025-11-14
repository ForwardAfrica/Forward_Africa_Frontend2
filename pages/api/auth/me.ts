import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

const initFirebaseAdmin = () => {
  if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (err) {
      serviceAccount = serviceAccountKey;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
};

class JWTManager {
  private static JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initFirebaseAdmin();

    // Get token from cookie or Authorization header
    let token = req.cookies.auth_token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log('❌ No token provided in cookie or Authorization header');
      return res.status(401).json({ error: 'No token provided - authentication required' });
    }

    // Verify token
    let payload;
    try {
      console.log('🔐 Verifying token...');
      payload = JWTManager.verifyToken(token);
      console.log('✅ Token verified successfully for user:', payload.userId);
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
    }

    // Get user data from Firebase
    let userRecord;
    try {
      userRecord = await admin.auth().getUser(payload.userId);
    } catch (error: any) {
      console.error('❌ Failed to get user from Firebase:', error.message);
      return res.status(401).json({ error: 'User not found' });
    }

    // Get user profile from Firestore
    let userData: any = {};
    let userRole = payload.role || 'user';
    let userPermissions = payload.permissions || [];

    try {
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (userDoc.exists) {
        userData = userDoc.data() || {};
        userRole = userData.role || userRole;
        userPermissions = userData.permissions || userPermissions;
      }
    } catch (error) {
      console.warn('Could not fetch Firestore user data:', error);
    }

    const responseUser = {
      id: userRecord.uid,
      email: userRecord.email,
      full_name: userRecord.displayName || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      role: userRole,
      permissions: userPermissions,
      onboarding_completed: userData.onboarding_completed || false,
      ...userData
    };

    return res.status(200).json(responseUser);

  } catch (error: any) {
    console.error('❌ Get user error:', error);
    return res.status(500).json({ error: 'Failed to fetch user', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
