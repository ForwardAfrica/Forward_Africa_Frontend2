/**
 * JWT Helper Utilities
 * Extracts user information from JWT tokens in requests
 */

class JWTHelper {
  /**
   * Extract user info from Authorization header or cookies
   */
  static extractUserFromRequest(req) {
    try {
      const authHeader = req.headers.authorization;
      let token = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Try to get from cookies
        const cookies = req.headers.cookie || '';
        const match = cookies.match(/app_user=([^;]+)/);
        token = match ? match[1] : null;
      }

      if (!token) return null;

      // Decode JWT (this is a simple decode, not verification)
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString()
      );

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      };
    } catch (error) {
      console.error('Failed to extract user from request:', error);
      return null;
    }
  }

  /**
   * Get client IP from request
   */
  static getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    return (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded) ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown';
  }

  /**
   * Get user agent from request
   */
  static getUserAgent(req) {
    return req.headers['user-agent'] || 'unknown';
  }
}

module.exports = JWTHelper;
