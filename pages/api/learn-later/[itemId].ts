import { NextApiRequest, NextApiResponse } from 'next';
import JWTManager from '../../../backend/lib/jwtManager';

// In-memory storage (same as index.ts - in production, use database)
interface LearnLaterItem {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  created_at: string;
}

// Shared in-memory storage (replace with database in production)
// Import from a shared module or use a database
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
    const { itemId } = req.query;

    if (req.method === 'DELETE') {
      // Remove item from learn later
      const items = learnLaterStore.get(userId) || [];
      const itemIndex = items.findIndex(item => item.id === itemId);

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in learn later list' });
      }

      items.splice(itemIndex, 1);
      learnLaterStore.set(userId, items);

      return res.status(200).json({
        success: true,
        message: 'Removed from learn later successfully'
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

