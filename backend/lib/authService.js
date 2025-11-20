const admin = require('firebase-admin');
const JWTManager = require('./jwtManager');

// Initialize Firebase Admin if not already done
const initFirebaseAdmin = () => {
  if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured in environment');
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
  return admin;
};

class AuthService {
  // Authenticate user with email and password
  static async authenticateWithPassword(email, password) {
    try {
      // Initialize Firebase Admin SDK
      const adminApp = initFirebaseAdmin();

      // Verify user exists and get their details from Firebase
      let userRecord;
      try {
        userRecord = await adminApp.auth().getUserByEmail(email);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          throw new Error('INVALID_CREDENTIALS');
        }
        throw error;
      }

      // Get user's custom claims (role, permissions, etc.)
      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'user';

      // Get user profile from Firestore
      let userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || null,
        role
      };

      try {
        const db = adminApp.firestore();
        const userDoc = await db.collection('users').doc(userRecord.uid).get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          userProfile = {
            ...userProfile,
            ...userData,
            uid: userRecord.uid // Ensure uid is preserved
          };
        }
      } catch (error) {
        console.warn('Could not fetch Firestore user data:', error);
        // Continue with minimal user profile
      }

      // Create JWT token with user information
      const tokenPayload = {
        userId: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || null,
        role: role
      };

      const accessToken = JWTManager.createToken(tokenPayload);
      const refreshToken = JWTManager.createRefreshToken(userRecord.uid);

      return {
        accessToken,
        refreshToken,
        user: userProfile
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  // Create new user account
  static async createUser(email, password, displayName = '', userData = {}) {
    try {
      const adminApp = initFirebaseAdmin();

      // Create Firebase auth user
      const userRecord = await adminApp.auth().createUser({
        email: String(email),
        password: String(password),
        displayName: String(displayName),
      });

      // Set default role
      const role = 'user';

      try {
        await adminApp.auth().setCustomUserClaims(userRecord.uid, {
          role
        });
      } catch (error) {
        console.warn('Could not set custom claims:', error);
      }

      // Create user profile in Firestore
      try {
        const db = adminApp.firestore();
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: displayName,
          photoURL: null,
          role,
          ...userData,
          onboarding_completed: false,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.warn('Could not create Firestore document:', error);
      }

      // Create JWT tokens
      const tokenPayload = {
        userId: userRecord.uid,
        email: userRecord.email,
        displayName: displayName,
        photoURL: null,
        role
      };

      const accessToken = JWTManager.createToken(tokenPayload);
      const refreshToken = JWTManager.createRefreshToken(userRecord.uid);

      return {
        accessToken,
        refreshToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: displayName,
          photoURL: null,
          role,
          onboarding_completed: false
        }
      };
    } catch (error) {
      console.error('User creation error:', error);
      throw error;
    }
  }

  // Refresh access token using refresh token
  static async refreshAccessToken(refreshToken) {
    try {
      const payload = JWTManager.verifyRefreshToken(refreshToken);

      const adminApp = initFirebaseAdmin();
      const userRecord = await adminApp.auth().getUser(payload.userId);

      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'user';
      const permissions = customClaims.permissions || [];

      // Get updated user profile
      let userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || null,
        role,
        permissions
      };

      try {
        const db = adminApp.firestore();
        const userDoc = await db.collection('users').doc(userRecord.uid).get();

        if (userDoc.exists) {
          userProfile = {
            ...userProfile,
            ...userDoc.data(),
            uid: userRecord.uid
          };
        }
      } catch (error) {
        console.warn('Could not fetch updated Firestore data:', error);
      }

      const tokenPayload = {
        userId: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || null,
        role: role,
        permissions: permissions
      };

      const newAccessToken = JWTManager.createToken(tokenPayload);
      const newRefreshToken = JWTManager.createRefreshToken(userRecord.uid);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: userProfile
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Verify JWT token and get user data
  static async verifyTokenAndGetUser(token) {
    try {
      const payload = JWTManager.verifyToken(token);

      const adminApp = initFirebaseAdmin();
      const userRecord = await adminApp.auth().getUser(payload.userId);

      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'user';
      const permissions = customClaims.permissions || [];

      let userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || null,
        role,
        permissions
      };

      try {
        const db = adminApp.firestore();
        const userDoc = await db.collection('users').doc(userRecord.uid).get();

        if (userDoc.exists) {
          userProfile = {
            ...userProfile,
            ...userDoc.data(),
            uid: userRecord.uid
          };
        }
      } catch (error) {
        console.warn('Could not fetch Firestore user data:', error);
      }

      return userProfile;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    try {
      const adminApp = initFirebaseAdmin();
      const userRecord = await adminApp.auth().getUser(userId);

      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'user';

      let userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        photoURL: userRecord.photoURL || null,
        role
      };

      try {
        const db = adminApp.firestore();
        const userDoc = await db.collection('users').doc(userId).get();

        if (userDoc.exists) {
          userProfile = {
            ...userProfile,
            ...userDoc.data(),
            uid: userId
          };
        }
      } catch (error) {
        console.warn('Could not fetch Firestore user data:', error);
      }

      return userProfile;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  // Update user role
  static async updateUserRole(userId, newRole) {
    try {
      const adminApp = initFirebaseAdmin();

      // Update Firebase custom claims
      await adminApp.auth().setCustomUserClaims(userId, {
        role: newRole
      });

      // Update Firestore
      try {
        const db = adminApp.firestore();
        await db.collection('users').doc(userId).update({
          role: newRole,
          permissions,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.warn('Could not update Firestore user:', error);
      }

      return { success: true, message: 'User role updated' };
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  }

  // Logout user (invalidate refresh token if stored server-side)
  static async logoutUser(userId) {
    try {
      // In this implementation, tokens are stateless, so logout is mainly client-side
      // You could store revoked tokens in a blacklist if needed
      console.log(`User ${userId} logged out`);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
