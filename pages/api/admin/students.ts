import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const users = await FirestoreService.getUsers();

    console.log('📊 Total users fetched:', users.length);
    console.log('👥 User roles:', users.map(u => ({ id: u.id, role: u.role })));

    const students = users.filter(user => user.role === 'user');

    console.log('📚 Students after filtering:', students.length);

    return res.status(200).json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error: any) {
    console.error('❌ Students list API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch students'
    });
  }
}
