import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const instructor = await FirestoreService.getInstructorByEmail(email);

    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'Instructor not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: instructor
    });
  } catch (error: any) {
    console.error('❌ Instructor by email API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch instructor'
    });
  }
}
