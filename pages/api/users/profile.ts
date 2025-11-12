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
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initFirebaseAdmin();

    // Get token from cookie or Authorization header
    let token = req.cookies.auth_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    let payload;
    try {
      payload = JWTManager.verifyToken(token);
    } catch (error: any) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = payload.userId;
    const profileData = req.body;

    // Get user record
    const userRecord = await admin.auth().getUser(userId);

    // Update Firebase Auth if email or displayName is provided
    const authUpdateData: any = {};
    
    if (profileData.email && profileData.email !== userRecord.email) {
      authUpdateData.email = profileData.email;
    }

    if (profileData.full_name || profileData.displayName) {
      authUpdateData.displayName = profileData.full_name || profileData.displayName;
    }

    if (Object.keys(authUpdateData).length > 0) {
      try {
        await admin.auth().updateUser(userId, authUpdateData);
      } catch (error) {
        console.warn('Could not update Firebase Auth:', error);
      }
    }

    // Update Firestore user profile
    const firestoreUpdateData = {
      ...profileData,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    // Remove email from firestore update if it was handled in auth
    if (authUpdateData.email) {
      delete firestoreUpdateData.email;
    }

    try {
      const db = admin.firestore();
      await db.collection('users').doc(userId).update(firestoreUpdateData);
    } catch (error) {
      console.warn('Could not update Firestore:', error);
    }

    // Fetch updated user data
    const updatedUserRecord = await admin.auth().getUser(userId);

    let userData: any = {};
    let userRole = 'user';
    let userPermissions: string[] = [];

    try {
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userId).get();

      if (userDoc.exists) {
        userData = userDoc.data() || {};
        userRole = userData.role || userRole;
        userPermissions = userData.permissions || userPermissions;
      }
    } catch (error) {
      console.warn('Could not fetch updated user data:', error);
    }

    const responseUser = {
      id: updatedUserRecord.uid,
      email: updatedUserRecord.email,
      full_name: updatedUserRecord.displayName || '',
      displayName: updatedUserRecord.displayName || '',
      photoURL: updatedUserRecord.photoURL || null,
      role: userRole,
      permissions: userPermissions,
      ...userData
    };

    return res.status(200).json(responseUser);

  } catch (error: any) {
    console.error('❌ Profile update error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
