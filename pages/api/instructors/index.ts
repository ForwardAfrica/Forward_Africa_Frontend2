import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const instructors = await FirestoreService.getInstructors();

      return res.status(200).json({
        success: true,
        data: instructors,
        count: instructors.length
      });
    }

    if (req.method === 'POST') {
      const instructorData = req.body;

      if (!instructorData.name || !instructorData.email) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, email'
        });
      }

      const instructorId = await FirestoreService.createInstructor(instructorData);

      return res.status(201).json({
        success: true,
        message: 'Instructor created successfully',
        instructorId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Instructors API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process instructors'
    });
  }
}
