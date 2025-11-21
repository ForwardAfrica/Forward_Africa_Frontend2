import { NextApiRequest, NextApiResponse } from 'next';
import FirestoreService from '../../../backend/lib/firestoreService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const categories = await FirestoreService.getCategories();

      return res.status(200).json({
        success: true,
        data: categories,
        count: categories.length
      });
    } else if (req.method === 'POST') {
      const { name, id } = req.body;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Category name is required'
        });
      }

      const categoryData = {
        name: name.trim(),
        id: id || name.toLowerCase().replace(/\s+/g, '-')
      };

      const newCategory = await FirestoreService.createCategory(categoryData);

      return res.status(201).json({
        success: true,
        data: newCategory,
        message: 'Category created successfully'
      });
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error: any) {
    console.error('❌ Categories API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process category request'
    });
  }
}
