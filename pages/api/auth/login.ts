import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Import audit service for logging
const AuditService = require('../../../backend/lib/auditService');

// Initialize Firebase Admin
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

    console.log('✅ Firebase Admin SDK initialized in login endpoint');
  }
};

// Verify password using Firebase REST API
const verifyPasswordWithFirebase = async (email: string, password: string, apiKey: string): Promise<any> => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true
    })
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.error?.message === 'INVALID_PASSWORD') {
      throw new Error('INVALID_PASSWORD');
    }
    if (error.error?.message === 'EMAIL_NOT_FOUND') {
      throw new Error('EMAIL_NOT_FOUND');
    }
    throw new Error(error.error?.message || 'Password verification failed');
  }

  return response.json();
};

// JWT utilities
class JWTManager {
  private static JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  private static JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 3600; // 1 hour

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
    return this.JWT_EXPIRES_IN * 1000; // in milliseconds
  }
}

// Validation utilities
const validation = {
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password: string): boolean => {
    return Boolean(password && password.length >= 6);
  },

  validateCredentials: (email: string, password: string): void => {
    if (!email || !password) {
      throw new Error('MISSING_CREDENTIALS');
    }

    if (!validation.validateEmail(email)) {
      throw new Error('INVALID_EMAIL');
    }

    if (!validation.validatePassword(password)) {
      throw new Error('WEAK_PASSWORD');
    }
  }
};

// Rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const rateLimit = {
  checkRateLimit: (email: string): void => {
    const now = Date.now();
    const attempts = loginAttempts.get(email);

    if (attempts && now - attempts.lastAttempt < LOCKOUT_DURATION) {
      if (attempts.count >= MAX_ATTEMPTS) {
        throw new Error('RATE_LIMITED');
      }
    } else if (attempts) {
      loginAttempts.delete(email);
    }
  },

  recordAttempt: (email: string, success: boolean): void => {
    const now = Date.now();

    if (success) {
      loginAttempts.delete(email);
    } else {
      const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
      attempts.count += 1;
      attempts.lastAttempt = now;
      loginAttempts.set(email, attempts);
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initFirebaseAdmin();

    const { email, password } = req.body;
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      throw new Error('FIREBASE_API_KEY is not configured');
    }

    // Validate input
    validation.validateCredentials(email, password);

    // Check rate limiting
    rateLimit.checkRateLimit(email);

    console.log('🔐 Login attempt for:', email);

    // Verify password using Firebase REST API
    let authResponse;
    try {
      authResponse = await verifyPasswordWithFirebase(email, password, apiKey);
    } catch (error: any) {
      rateLimit.recordAttempt(email, false);
      if (error.message === 'INVALID_PASSWORD' || error.message === 'EMAIL_NOT_FOUND') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      throw error;
    }

    // Get user record from Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error: any) {
      rateLimit.recordAttempt(email, false);
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      throw error;
    }

    // Get user's role from Firestore
    let userRole = 'user';
    let userData: any = {};

    try {
      const db = admin.firestore();
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      console.log('🔍 Firestore user lookup:', { uid: userRecord.uid, exists: userDoc.exists, data: userDoc.data() });

      if (userDoc.exists) {
        const data = userDoc.data();
        userRole = data?.role || 'user';
        console.log('📋 User document found:', { role: userRole, userData: data });
        userData = data || {};
      }
    } catch (error) {
      console.warn('Could not fetch user role from Firestore:', error);
    }

    // Update Firebase Auth custom claims to match Firestore (Firestore is source of truth)
    try {
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: userRole
      });
      console.log('✅ Updated Firebase Auth custom claims:', { role: userRole });
    } catch (error) {
      console.warn('⚠️ Could not update Firebase Auth custom claims:', error);
    }

    // Create JWT token with user information and role
    const tokenPayload = {
      userId: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      role: userRole
    };

    const jwtToken = JWTManager.createToken(tokenPayload);
    const tokenExpiryMs = JWTManager.getTokenExpiry();

    // Prepare user data for response
    const responseUser = {
      id: userRecord.uid,
      email: userRecord.email,
      full_name: userRecord.displayName || '',
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || null,
      role: userRole,
      ...userData
    };

    // Set JWT token in cookie (accessible to JavaScript)
    // Critical: DO NOT set Domain attribute - let browser use current domain only
    // This ensures document.cookie can access the token
    const maxAge = Math.floor(tokenExpiryMs / 1000); // Convert ms to seconds
    const isProduction = process.env.NODE_ENV === 'production' ||
                         req.headers.host?.includes('fly.dev') ||
                         req.headers['x-forwarded-proto'] === 'https';

    const cookieString = [
      `app_user=${jwtToken}`,
      "Path=/",
      // When in production OR inside Builder.io iframe → must use None; Secure
      isProduction ? "SameSite=None" : "SameSite=Lax",
      isProduction ? "Secure" : "",
      `Max-Age=${maxAge}`
    ].filter(Boolean).join("; ");

    console.log(`🔐 Login: Setting app_user cookie (max-age: ${maxAge}s, secure: ${isProduction})`);
    res.setHeader('Set-Cookie', cookieString);

    rateLimit.recordAttempt(email, true);

    console.log('✅ Login successful for:', email, 'with role:', userRole);

    return res.status(200).json({
      message: 'Login successful',
      user: responseUser,
      token: jwtToken // Also return token for client-side storage if needed
    });

  } catch (error: any) {
    console.error('❌ Login error:', error?.message || error);

    const errorMessages: { [key: string]: { status: number; message: string } } = {
      'MISSING_CREDENTIALS': { status: 400, message: 'Email and password are required' },
      'INVALID_EMAIL': { status: 400, message: 'Please enter a valid email address' },
      'WEAK_PASSWORD': { status: 400, message: 'Password must be at least 6 characters' },
      'RATE_LIMITED': { status: 429, message: 'Too many login attempts. Please try again later.' },
      'FIREBASE_API_KEY is not configured': { status: 500, message: 'Server configuration error - FIREBASE_API_KEY missing' }
    };

    const errorInfo = errorMessages[error?.message];
    if (errorInfo) {
      console.error('Mapped error response:', errorInfo);
      return res.status(errorInfo.status).json({ error: errorInfo.message });
    }

    // Log full error for debugging
    console.error('Unmapped error:', error?.message, error?.toString());
    return res.status(500).json({
      error: 'Login failed. Please try again.',
      debug: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
