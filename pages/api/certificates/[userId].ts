import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const certificates = await FirestoreService.getUserCertificates(userId);

      return res.status(200).json({
        success: true,
        data: certificates,
        count: certificates.length
      });
    }

    if (req.method === 'POST') {
      const certificateData = req.body;

      if (!certificateData.course_id || !certificateData.course_title) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: course_id, course_title'
        });
      }

      const certificateId = await FirestoreService.createCertificate({
        ...certificateData,
        user_id: userId
      });

      return res.status(201).json({
        success: true,
        message: 'Certificate created successfully',
        certificateId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Certificates API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process certificates'
    });
  }
}
