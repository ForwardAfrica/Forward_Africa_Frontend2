import { NextApiRequest, NextApiResponse } from 'next';
import JWTManager from '../../../backend/lib/jwtManager';

// In-memory storage for learn later items (replace with database in production)
// In production, you should use a database table similar to favorites
interface LearnLaterItem {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  created_at: string;
}

// Shared in-memory storage (replace with database in production)
declare global {
  var learnLaterStore: Map<string, LearnLaterItem[]> | undefined;
}

const learnLaterStore = global.learnLaterStore || new Map<string, LearnLaterItem[]>();
if (!global.learnLaterStore) {
  global.learnLaterStore = learnLaterStore;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const payload = JWTManager.verifyToken(token);
    
    if (!payload || !payload.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = payload.userId;

    if (req.method === 'GET') {
      // Get all learn later items for user
      const items = learnLaterStore.get(userId) || [];
      
      // In production, fetch courses from database and join with learn later items
      // For now, return the items with course_id
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      // Add item to learn later
      const { course_id, lesson_id } = req.body;

      if (!course_id) {
        return res.status(400).json({ error: 'course_id is required' });
      }

      const items = learnLaterStore.get(userId) || [];
      
      // Check if already exists
      const exists = items.some(item => 
        item.course_id === course_id && 
        (!lesson_id || item.lesson_id === lesson_id)
      );

      if (exists) {
        return res.status(400).json({ error: 'Item already in learn later list' });
      }

      const newItem: LearnLaterItem = {
        id: `learn-later-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        course_id,
        lesson_id: lesson_id || undefined,
        created_at: new Date().toISOString(),
      };

      items.push(newItem);
      learnLaterStore.set(userId, items);

      return res.status(201).json({
        success: true,
        data: newItem,
        message: 'Added to learn later successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Learn later API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

