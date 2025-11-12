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
  private static JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 3600;

  static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
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

const validation = {
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password: string): boolean => {
    return Boolean(password && password.length >= 6);
  },

  validateName: (name: string): boolean => {
    return Boolean(name && name.trim().length >= 2);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initFirebaseAdmin();

    const {
      email,
      password,
      full_name,
      education_level,
      job_title,
      topics_of_interest,
      industry,
      experience_level,
      business_stage,
      country,
      state_province,
      city
    } = req.body;

    // Validate required fields
    if (!email || !password || !full_name) {
      return res.status(400).json({
        error: 'Email, password, and full name are required'
      });
    }

    if (!validation.validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!validation.validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    if (!validation.validateName(full_name)) {
      return res.status(400).json({
        error: 'Full name must be at least 2 characters'
      });
    }

    console.log('📝 Registration attempt for:', email);

    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: String(email),
        password: String(password),
        displayName: String(full_name),
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      throw error;
    }

    // Set default role
    const userRole = 'user';
    const userPermissions: string[] = [];

    try {
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: userRole,
        permissions: userPermissions
      });
    } catch (error) {
      console.warn('Could not set custom claims:', error);
    }

    // Create Firestore user profile
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: full_name,
      photoURL: null,
      role: userRole,
      permissions: userPermissions,
      education_level: education_level || null,
      job_title: job_title || null,
      topics_of_interest: topics_of_interest || [],
      industry: industry || null,
      experience_level: experience_level || null,
      business_stage: business_stage || null,
      country: country || null,
      state_province: state_province || null,
      city: city || null,
      onboarding_completed: false,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    try {
      const db = admin.firestore();
      await db.collection('users').doc(userRecord.uid).set(userProfile);
    } catch (error) {
      console.warn('Could not create Firestore user profile:', error);
    }

    // Create JWT token with user information and role
    const tokenPayload = {
      userId: userRecord.uid,
      email: userRecord.email,
      displayName: full_name,
      photoURL: null,
      role: userRole,
      permissions: userPermissions
    };

    const jwtToken = JWTManager.createToken(tokenPayload);
    const tokenExpiryMs = JWTManager.getTokenExpiry();

    // Set JWT token in HTTP-only cookie
    const cookieOptions = [
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      `Max-Age=${tokenExpiryMs / 1000}`,
      process.env.NODE_ENV === 'production' ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', `auth_token=${jwtToken}; ${cookieOptions}`);

    console.log('✅ Registration successful for:', email);

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        full_name: full_name,
        displayName: full_name,
        photoURL: null,
        role: userRole,
        permissions: userPermissions,
        onboarding_completed: false
      },
      token: jwtToken
    });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      error: error.message || 'Registration failed'
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
