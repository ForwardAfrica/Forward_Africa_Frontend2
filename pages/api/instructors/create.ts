import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebaseAdmin';
import JWTManager from '../../../backend/lib/jwtManager';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.substring(7);
    const payload = JWTManager.verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Extract instructor data from request body
    const instructorData = req.body;

    // Validate required fields
    if (!instructorData.name || !instructorData.email || !instructorData.title) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, title'
      });
    }

    // Create instructor document in Firestore using Admin SDK
    // This bypasses security rules and succeeds if the service account has write permissions
    const docRef = await db.collection('instructors').add({
      name: instructorData.name,
      title: instructorData.title,
      email: instructorData.email,
      phone: instructorData.phone || null,
      bio: instructorData.bio || '',
      image: instructorData.image || '',
      experience: instructorData.experience || 0,
      expertise: instructorData.expertise || [],
      socialLinks: instructorData.socialLinks || {
        linkedin: '',
        twitter: '',
        website: ''
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: payload.userId
    });

    res.status(201).json({
      id: docRef.id,
      message: 'Instructor created successfully',
      data: {
        id: docRef.id,
        ...instructorData
      }
    });
  } catch (error: any) {
    console.error('Error creating instructor:', error);

    // Handle JWT verification errors
    if (error.message === 'Invalid token' || error.message.includes('jwt')) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Handle Firestore permission errors
    if (error.code === 'permission-denied') {
      return res.status(403).json({
        error: 'Permission denied: Service account does not have write access to Firestore'
      });
    }

    res.status(500).json({
      error: error.message || 'Failed to create instructor'
    });
  }
}
