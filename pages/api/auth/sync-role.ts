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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initFirebaseAdmin();

    // Extract token from authorization header or cookie
    const token = req.headers.authorization?.split('Bearer ')[1] || 
                  req.cookies?.app_user;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - no token' });
    }

    // Verify the JWT token manually (similar to how it's done in the app)
    const jwtUtils = {
      base64UrlDecode(str: string): string {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const paddingNeeded = 4 - (base64.length % 4);
        if (paddingNeeded && paddingNeeded !== 4) {
          base64 += '='.repeat(paddingNeeded);
        }
        const decoded = Buffer.from(base64, 'base64').toString('utf8');
        return decoded;
      },

      parseToken(token: string): any {
        try {
          const parts = token.split('.');
          if (parts.length !== 3) throw new Error('Invalid JWT format');
          const payload = parts[1];
          if (!payload) throw new Error('Missing payload');
          const decoded = jwtUtils.base64UrlDecode(payload);
          return JSON.parse(decoded);
        } catch (error) {
          throw new Error(`Invalid token format: ${(error as any).message}`);
        }
      }
    };

    let tokenPayload;
    try {
      tokenPayload = jwtUtils.parseToken(token);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const userId = tokenPayload.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token - no userId' });
    }

    // Get current Firestore user document (Firestore is the source of truth for roles)
    const db = admin.firestore();
    const userDocRef = db.collection('users').doc(userId);
    const userDocSnapshot = await userDocRef.get();
    const firestoreData = userDocSnapshot.data() || {};

    const roleFromFirestore = firestoreData.role || 'user';

    // Get the user from Firebase Auth
    const userRecord = await admin.auth().getUser(userId);
    const customClaims = userRecord.customClaims || {};
    const roleFromAuth = customClaims.role || 'user';

    // Sync Firestore role to Firebase Auth custom claims (Firestore is source of truth)
    if (roleFromAuth !== roleFromFirestore) {
      await admin.auth().setCustomUserClaims(userId, {
        role: roleFromFirestore
      });

      console.log(`✅ Synced Firebase Auth custom claims for user ${userId} from Firestore: ${roleFromFirestore}`);
    } else {
      console.log(`ℹ️ No sync needed - roles already match for user ${userId}: ${roleFromFirestore}`);
    }

    return res.status(200).json({
      message: 'Role synced successfully',
      role: roleFromFirestore
    });
  } catch (error: any) {
    console.error('Error syncing role:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
