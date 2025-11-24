const { getFirestore } = require('./firebaseAdmin');
const admin = require('firebase-admin');

class AuditService {
  /**
   * Create an audit log entry
   */
  static async createLog(auditData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('audit_logs').doc();

      await docRef.set({
        user_id: auditData.user_id || '',
        user_email: auditData.user_email || '',
        action: auditData.action || '',
        resource_type: auditData.resource_type || '',
        resource_id: auditData.resource_id || '',
        details: auditData.details || {},
        ip_address: auditData.ip_address || '',
        user_agent: auditData.user_agent || '',
        created_at: auditData.created_at || new Date().toISOString(),
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating audit log:', error);
      throw error;
    }
  }

  /**
   * Log a login attempt
   */
  static async logLogin(userId, userEmail, success, ipAddress, userAgent, failureReason = null) {
    return this.createLog({
      user_id: userId || '',
      user_email: userEmail || '',
      action: success ? 'LOGIN' : 'LOGIN_FAILED',
      resource_type: 'AUTH',
      details: {
        success,
        failure_reason: failureReason,
        method: 'email_password'
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log a logout
   */
  static async logLogout(userId, userEmail, ipAddress, userAgent) {
    return this.createLog({
      user_id: userId,
      user_email: userEmail,
      action: 'LOGOUT',
      resource_type: 'AUTH',
      details: {},
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log a course action
   */
  static async logCourseAction(action, userId, userEmail, courseId, courseTitle, details, ipAddress, userAgent) {
    const actionMap = {
      'create': 'COURSE_CREATED',
      'update': 'COURSE_UPDATED',
      'delete': 'COURSE_DELETED'
    };

    return this.createLog({
      user_id: userId,
      user_email: userEmail,
      action: actionMap[action] || `COURSE_${action.toUpperCase()}`,
      resource_type: 'COURSE',
      resource_id: courseId,
      details: {
        course_title: courseTitle,
        action,
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log an instructor action
   */
  static async logInstructorAction(action, userId, userEmail, instructorId, instructorName, details, ipAddress, userAgent) {
    const actionMap = {
      'create': 'INSTRUCTOR_CREATED',
      'update': 'INSTRUCTOR_UPDATED',
      'delete': 'INSTRUCTOR_DELETED'
    };

    return this.createLog({
      user_id: userId,
      user_email: userEmail,
      action: actionMap[action] || `INSTRUCTOR_${action.toUpperCase()}`,
      resource_type: 'INSTRUCTOR',
      resource_id: instructorId,
      details: {
        instructor_name: instructorName,
        action,
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log a lesson action
   */
  static async logLessonAction(action, userId, userEmail, lessonId, courseId, details, ipAddress, userAgent) {
    const actionMap = {
      'start': 'LESSON_STARTED',
      'complete': 'LESSON_COMPLETED'
    };

    return this.createLog({
      user_id: userId,
      user_email: userEmail,
      action: actionMap[action] || `LESSON_${action.toUpperCase()}`,
      resource_type: 'LESSON',
      resource_id: lessonId,
      details: {
        course_id: courseId,
        action,
        ...details
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });
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

module.exports = AuditService;
