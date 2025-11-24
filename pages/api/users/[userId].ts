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

    console.log('✅ Firebase Admin SDK initialized in user endpoint');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    initFirebaseAdmin();

    if (req.method === 'GET') {
      const userData = await FirestoreService.getUserData(userId);

      if (!userData) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: userData
      });
    }

    if (req.method === 'PUT') {
      const { role, suspended, password, passwordHash, ...otherData } = req.body;

      // Start with other data updates
      const updateData: any = { ...otherData };

      // Handle role change
      if (role !== undefined) {
        updateData.role = role;
        console.log(`✅ Updating role for user ${userId} to ${role}`);
      }

      // Handle suspension status
      if (suspended !== undefined) {
        updateData.suspended = suspended;
        console.log(`✅ Setting suspended status for user ${userId} to ${suspended}`);
      }

      // Handle password change - update in Firebase Auth
      if (password) {
        try {
          await admin.auth().updateUser(userId, {
            password: password
          });
          console.log(`✅ Password updated for user ${userId}`);
          // Don't store password in Firestore, it's managed by Firebase Auth
        } catch (authError: any) {
          console.error('❌ Error updating password in Firebase Auth:', authError);
          return res.status(400).json({
            success: false,
            error: 'Failed to update password: ' + authError.message
          });
        }
      }

      // Update user data in Firestore
      await FirestoreService.updateUserData(userId, updateData);

      return res.status(200).json({
        success: true,
        message: 'User updated successfully'
      });
    }

    if (req.method === 'DELETE') {
      // Delete user from Firebase Auth
      try {
        await admin.auth().deleteUser(userId);
      } catch (error: any) {
        console.warn('⚠️ User not found in Firebase Auth, continuing with Firestore deletion:', error.message);
      }

      // Delete user data from Firestore
      const db = admin.firestore();
      await db.collection('users').doc(userId).delete();

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ User API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process user request'
    });
  }
}
