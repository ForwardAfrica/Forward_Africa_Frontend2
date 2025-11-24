import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';
import FirestoreService from '../../../backend/lib/firestoreService';

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

    console.log('✅ Firebase Admin SDK initialized in create-admin-user endpoint');
  }
};

// Validation utilities
const validation = {
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password: string): boolean => {
    return Boolean(password && password.length >= 8);
  },

  validateName: (name: string): boolean => {
    return Boolean(name && name.trim().length >= 2);
  }
};

const validRoles = ['Content Manager', 'Community Manager', 'User Support', 'Super Admin'];

const decodeToken = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const decoded = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initFirebaseAdmin();

    // Check authorization - must have valid JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = decodeToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid authorization token'
      });
    }

    // Verify user is a Super Admin
    const userRole = decoded.role || 'user';
    if (userRole !== 'Super Admin') {
      return res.status(403).json({
        error: 'Only Super Admins can create admin users'
      });
    }

    const { email, password, full_name, role } = req.body;

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({
        error: 'Email, password, full name, and role are required'
      });
    }

    // Validate email format
    if (!validation.validateEmail(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address'
      });
    }

    // Validate password
    if (!validation.validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long'
      });
    }

    // Validate name
    if (!validation.validateName(full_name)) {
      return res.status(400).json({
        error: 'Full name must be at least 2 characters long'
      });
    }

    // Validate role
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role selected'
      });
    }

    console.log('🔐 Creating admin user:', { email, role });

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await admin.auth().getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'An account with this email already exists'
        });
      }
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // User doesn't exist, continue
    }

    // Create user in Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email: email.trim(),
        password: password,
        displayName: full_name.trim(),
        emailVerified: false
      });

      console.log('✅ User created in Firebase Auth:', userRecord.uid);
    } catch (error: any) {
      console.error('❌ Error creating user in Firebase Auth:', error);
      
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({
          error: 'An account with this email already exists'
        });
      }
      
      if (error.code === 'auth/invalid-password') {
        return res.status(400).json({
          error: 'Password does not meet security requirements'
        });
      }

      throw error;
    }

    // Save user to Firestore with role
    const db = admin.firestore();
    const userData = {
      email: email.trim(),
      full_name: full_name.trim(),
      displayName: full_name.trim(),
      role: role,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      suspended: false,
      is_active: true,
      status: 'active'
    };

    try {
      await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });
      console.log('✅ User saved to Firestore:', userRecord.uid);
    } catch (error: any) {
      console.error('❌ Error saving user to Firestore:', error);
      
      // Try to delete the user from Firebase Auth if Firestore save fails
      try {
        await admin.auth().deleteUser(userRecord.uid);
      } catch (deleteError) {
        console.warn('⚠️ Could not delete user from Firebase Auth:', deleteError);
      }

      throw error;
    }

    console.log('✅ Admin user created successfully:', email);

    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        full_name: full_name,
        role: role
      }
    });

  } catch (error: any) {
    console.error('❌ Create admin user error:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Failed to create admin user. Please try again.'
    });
  }
}
