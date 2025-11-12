import type { NextApiRequest, NextApiResponse } from 'next'
import admin from 'firebase-admin'

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
      // In case it's already an object
      serviceAccount = serviceAccountKey;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

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

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'email, password and full_name are required' });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: String(email),
      password: String(password),
      displayName: String(full_name),
    });

    // Set default custom claims (role)
    try {
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });
    } catch (e) {
      // ignore
    }

    // Create Firestore profile
    try {
      const db = admin.firestore();
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: full_name,
        education_level: education_level || null,
        job_title: job_title || null,
        topics_of_interest: topics_of_interest || [],
        industry: industry || null,
        experience_level: experience_level || null,
        business_stage: business_stage || null,
        country: country || null,
        state_province: state_province || null,
        city: city || null,
        role: 'user',
        permissions: [],
        onboarding_completed: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not write Firestore document:', e);
      // Proceed even if Firestore write fails
    }

    return res.status(201).json({
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      message: 'User created'
    });
  } catch (error: any) {
    console.error('API /api/register error:', error);
    // Handle Firebase errors gracefully
    if (error.code === 'auth/email-already-exists' || (error.message && error.message.includes('email-already-exists'))) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return res.status(500).json({ error: error.message || 'Failed to register user' });
  }
}
