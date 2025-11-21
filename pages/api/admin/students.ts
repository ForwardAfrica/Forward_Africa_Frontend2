import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const users = await FirestoreService.getUsers();

    console.log('📊 Total users in database:', users.length);
    console.log('👥 ALL USERS:');
    users.forEach((u, idx) => {
      console.log(`  ${idx + 1}. id=${u.id}, email=${u.email}, role=${u.role}, onboarding_completed=${u.onboarding_completed}`);
    });

    const students = users.filter(user => user.role === 'user');

    console.log('\n📚 Filtered STUDENTS (role === "user"):', students.length);
    students.forEach((s, idx) => {
      console.log(`  ${idx + 1}. id=${s.id}, email=${s.email}, role=${s.role}`);
    });

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
