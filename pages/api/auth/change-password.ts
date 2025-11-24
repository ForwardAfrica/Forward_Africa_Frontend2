import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

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

    console.log('✅ Firebase Admin SDK initialized in change-password endpoint');
  }
};

// Validation utilities
const validation = {
  validatePassword: (password: string): boolean => {
    return Boolean(password && password.length >= 6);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initFirebaseAdmin();

    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({
        error: 'User ID and new password are required'
      });
    }

    if (!validation.validatePassword(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    console.log('🔐 Changing password for user:', userId);

    // Update password in Firebase Auth
    try {
      await admin.auth().updateUser(userId, {
        password: newPassword
      });

      console.log('✅ Password changed successfully for user:', userId);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      console.error('❌ Error changing password:', error);
      
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      if (error.code === 'auth/invalid-password') {
        return res.status(400).json({
          error: 'Invalid password format'
        });
      }

      throw error;
    }
  } catch (error: any) {
    console.error('❌ Change password error:', error?.message || error);
    return res.status(500).json({
      error: 'Failed to change password: ' + (error?.message || 'Unknown error')
    });
  }
}
