import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebaseAdmin';
import JWTManager from '../../../backend/lib/jwtManager';

// Import audit service
const AuditService = require('../../../backend/lib/auditService');

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

    // Comprehensive data transformation utilities
    // Define helper functions first
    const sanitizeUrl = (value: any): string | null => {
      if (!value) return null;
      const url = String(value).trim();
      if (!url) return null;
      try {
        // If it doesn't start with http:// or https://, add https://
        const fullUrl = url.startsWith('http://') || url.startsWith('https://') 
          ? url 
          : `https://${url}`;
        new URL(fullUrl);
        return fullUrl;
      } catch {
        return null;
      }
    };

    const transformData = {
      // Convert empty/undefined values to null for optional fields
      emptyToNull: (value: any): any => {
        if (value === '' || value === undefined || value === null) return null;
        if (typeof value === 'string' && value.trim() === '') return null;
        return value;
      },

      // Sanitize and trim strings
      sanitizeString: (value: any, allowEmpty: boolean = false): string | null => {
        if (value === null || value === undefined) return allowEmpty ? '' : null;
        const str = String(value).trim();
        if (str === '' && !allowEmpty) return null;
        return str === '' ? (allowEmpty ? '' : null) : str;
      },

      // Sanitize phone number
      sanitizePhone: (value: any): string | null => {
        if (!value) return null;
        const phone = String(value).trim();
        if (!phone) return null;
        // Remove formatting characters but keep + and digits
        const sanitized = phone.replace(/[\s\-\(\)\.]/g, '');
        // Validate it contains at least some digits
        if (!/[\d+]/.test(sanitized)) return null;
        return sanitized || null;
      },

      // Sanitize email
      sanitizeEmail: (value: any): string | null => {
        if (!value) return null;
        const email = String(value).trim().toLowerCase();
        if (!email) return null;
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return null;
        return email;
      },

      // Convert to number with validation
      toNumber: (value: any, defaultValue: number = 0, min?: number, max?: number): number => {
        if (value === null || value === undefined || value === '') return defaultValue;
        const num = typeof value === 'number' ? value : Number(value);
        if (isNaN(num)) return defaultValue;
        if (min !== undefined && num < min) return min;
        if (max !== undefined && num > max) return max;
        return num;
      },

      // Sanitize array
      sanitizeArray: (value: any, itemType: 'string' = 'string'): any[] => {
        if (!value) return [];
        if (!Array.isArray(value)) return [];
        if (itemType === 'string') {
          return value
            .map(item => String(item).trim())
            .filter(item => item.length > 0);
        }
        return value.filter(item => item !== null && item !== undefined);
      },

      // Sanitize URL (using the function defined above)
      sanitizeUrl: sanitizeUrl,

      // Sanitize social links object
      sanitizeSocialLinks: (value: any): { linkedin: string; twitter: string; website: string } => {
        const links = value || {};
        return {
          linkedin: sanitizeUrl(links.linkedin) || '',
          twitter: sanitizeUrl(links.twitter) || '',
          website: sanitizeUrl(links.website) || ''
        };
      }
    };

    // Validate required fields
    const name = transformData.sanitizeString(instructorData.name, false);
    const email = transformData.sanitizeEmail(instructorData.email);
    const title = transformData.sanitizeString(instructorData.title, false);

    if (!name) {
      return res.status(400).json({
        error: 'Missing required field: name'
      });
    }

    if (!email) {
      return res.status(400).json({
        error: 'Missing or invalid email address'
      });
    }

    if (!title) {
      return res.status(400).json({
        error: 'Missing required field: title'
      });
    }

    // Prepare data for Firestore with comprehensive transformations
    const firestoreData: any = {
      name: name,
      title: title,
      email: email,
      phone: transformData.sanitizePhone(instructorData.phone),
      bio: transformData.sanitizeString(instructorData.bio, true) || '',
      image: transformData.sanitizeString(instructorData.image, true) || '',
      experience: transformData.toNumber(instructorData.experience, 0, 0, 50),
      expertise: transformData.sanitizeArray(instructorData.expertise, 'string'),
      socialLinks: transformData.sanitizeSocialLinks(instructorData.socialLinks),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: payload.userId || null
    };

    // Create instructor document in Firestore using Admin SDK
    // This bypasses security rules and succeeds if the service account has write permissions
    const docRef = await db.collection('instructors').add(firestoreData);

    // Log instructor creation
    try {
      const ipAddress = AuditService.getClientIp(req);
      const userAgent = AuditService.getUserAgent(req);
      await AuditService.logInstructorAction(
        'create',
        payload.userId,
        payload.email,
        docRef.id,
        instructorData.name,
        { email: instructorData.email, title: instructorData.title },
        ipAddress,
        userAgent
      );
    } catch (auditError) {
      console.error('⚠️ Failed to log instructor creation audit event:', auditError);
    }

    res.status(201).json({
      id: docRef.id,
      message: 'Instructor created successfully',
      data: {
        id: docRef.id,
        ...firestoreData
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

    // Handle Firestore validation errors
    if (error.message && error.message.includes('string did not match the expected pattern')) {
      // Try to identify which field caused the issue
      let fieldHint = '';
      if (error.message.includes('email') || error.message.toLowerCase().includes('email')) {
        fieldHint = ' Please check the email address format.';
      } else if (error.message.includes('phone') || error.message.toLowerCase().includes('phone')) {
        fieldHint = ' Please check the phone number format (e.g., +1234567890).';
      }
      
      return res.status(400).json({
        error: `Invalid data format.${fieldHint} Please ensure all fields are correctly formatted.`
      });
    }

    // Handle other Firestore errors
    if (error.code) {
      return res.status(400).json({
        error: error.message || 'Invalid data format. Please check all fields and try again.'
      });
    }

    res.status(500).json({
      error: error.message || 'Failed to create instructor'
    });
  }
}
