const { getFirestore } = require('./firebaseAdmin');
const admin = require('firebase-admin');

class FirestoreService {
  // ============================================================================
  // COURSES
  // ============================================================================

  static async getCourses(limitCount = 20, lastDocId = null) {
    try {
      const db = getFirestore();
      let q = db.collection('courses')
        .orderBy('created_at', 'desc')
        .limit(limitCount);

      if (lastDocId) {
        const lastDoc = await db.collection('courses').doc(lastDocId).get();
        if (lastDoc.exists) {
          q = db.collection('courses')
            .orderBy('created_at', 'desc')
            .startAfter(lastDoc)
            .limit(limitCount);
        }
      }

      const snapshot = await q.get();
      const courses = [];
      snapshot.forEach(doc => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      throw error;
    }
  }

  static async getCourseById(courseId) {
    try {
      const db = getFirestore();
      const doc = await db.collection('courses').doc(courseId).get();

      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      throw error;
    }
  }

  static async getCoursesByCategory(category) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('courses')
        .where('category', '==', category)
        .where('coming_soon', '==', false)
        .orderBy('created_at', 'desc')
        .limit(20)
        .get();

      const courses = [];
      snapshot.forEach(doc => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      return courses;
    } catch (error) {
      console.error('❌ Error fetching courses by category:', error);
      throw error;
    }
  }

  static async getFeaturedCourses() {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('courses')
        .where('featured', '==', true)
        .where('coming_soon', '==', false)
        .orderBy('created_at', 'desc')
        .limit(6)
        .get();

      const courses = [];
      snapshot.forEach(doc => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      return courses;
    } catch (error) {
      console.error('❌ Error fetching featured courses:', error);
      throw error;
    }
  }

  static async createCourse(courseData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('courses').doc();

      const course = {
        ...courseData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      await docRef.set(course);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating course:', error);
      throw error;
    }
  }

  static async updateCourse(courseId, courseData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('courses').doc(courseId);

      await docRef.update({
        ...courseData,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw error;
    }
  }

  static async deleteCourse(courseId) {
    try {
      const db = getFirestore();
      await db.collection('courses').doc(courseId).delete();
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      throw error;
    }
  }

  // ============================================================================
  // USER PROGRESS
  // ============================================================================

  static async getUserProgress(userId, courseId) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('progress')
        .doc(userId)
        .collection('courses')
        .doc(courseId)
        .collection('lessons')
        .orderBy('order', 'asc')
        .get();

      const progress = [];
      snapshot.forEach(doc => {
        progress.push({ id: doc.id, ...doc.data() });
      });

      return progress;
    } catch (error) {
      console.error('❌ Error fetching user progress:', error);
      throw error;
    }
  }

  static async updateUserProgress(userId, courseId, lessonId, progressData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('progress')
        .doc(userId)
        .collection('courses')
        .doc(courseId)
        .collection('lessons')
        .doc(lessonId);

      await docRef.set({
        ...progressData,
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        last_accessed: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('❌ Error updating user progress:', error);
      throw error;
    }
  }

  static async markLessonComplete(userId, courseId, lessonId) {
    try {
      const db = getFirestore();
      const docRef = db.collection('progress')
        .doc(userId)
        .collection('courses')
        .doc(courseId)
        .collection('lessons')
        .doc(lessonId);

      await docRef.set({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        completed: true,
        progress_percentage: 100,
        completed_at: admin.firestore.FieldValue.serverTimestamp(),
        last_accessed: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('��� Error marking lesson complete:', error);
      throw error;
    }
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  static async getCategories() {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('categories')
        .orderBy('name', 'asc')
        .get();

      const categories = [];
      snapshot.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });

      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  }

  // ============================================================================
  // INSTRUCTORS
  // ============================================================================

  static async getInstructors() {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('instructors')
        .orderBy('name', 'asc')
        .get();

      const instructors = [];
      snapshot.forEach(doc => {
        instructors.push({ id: doc.id, ...doc.data() });
      });

      return instructors;
    } catch (error) {
      console.error('❌ Error fetching instructors:', error);
      throw error;
    }
  }

  static async getInstructorById(instructorId) {
    try {
      const db = getFirestore();
      const doc = await db.collection('instructors').doc(instructorId).get();

      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching instructor:', error);
      throw error;
    }
  }

  static async createInstructor(instructorData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('instructors').doc();

      await docRef.set({
        ...instructorData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating instructor:', error);
      throw error;
    }
  }

  static async updateInstructor(instructorId, instructorData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('instructors').doc(instructorId);

      await docRef.update({
        ...instructorData,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error updating instructor:', error);
      throw error;
    }
  }

  static async deleteInstructor(instructorId) {
    try {
      const db = getFirestore();
      await db.collection('instructors').doc(instructorId).delete();
    } catch (error) {
      console.error('❌ Error deleting instructor:', error);
      throw error;
    }
  }

  static async getInstructorByEmail(email) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('instructors')
        .where('email', '==', email)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching instructor by email:', error);
      throw error;
    }
  }

  // ============================================================================
  // CERTIFICATES
  // ============================================================================

  static async getUserCertificates(userId) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('certificates')
        .where('user_id', '==', userId)
        .orderBy('issued_at', 'desc')
        .get();

      const certificates = [];
      snapshot.forEach(doc => {
        certificates.push({ id: doc.id, ...doc.data() });
      });

      return certificates;
    } catch (error) {
      console.error('❌ Error fetching certificates:', error);
      throw error;
    }
  }

  static async createCertificate(certificateData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('certificates').doc();

      await docRef.set({
        ...certificateData,
        issued_at: admin.firestore.FieldValue.serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating certificate:', error);
      throw error;
    }
  }

  // ============================================================================
  // ACHIEVEMENTS
  // ============================================================================

  static async getUserAchievements(userId) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('achievements')
        .doc(userId)
        .collection('user_achievements')
        .orderBy('earned_at', 'desc')
        .get();

      const achievements = [];
      snapshot.forEach(doc => {
        achievements.push({ id: doc.id, ...doc.data() });
      });

      return achievements;
    } catch (error) {
      console.error('❌ Error fetching achievements:', error);
      throw error;
    }
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  static async getUserNotifications(userId) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('notifications')
        .doc(userId)
        .collection('user_notifications')
        .orderBy('created_at', 'desc')
        .limit(50)
        .get();

      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });

      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  static async markNotificationAsRead(userId, notificationId) {
    try {
      const db = getFirestore();
      const docRef = db.collection('notifications')
        .doc(userId)
        .collection('user_notifications')
        .doc(notificationId);

      await docRef.update({ read: true });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  static async createAuditLog(auditData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('audit_logs').doc();

      await docRef.set({
        ...auditData,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating audit log:', error);
      throw error;
    }
  }

  static async getAuditLogs(limitCount = 100) {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(limitCount)
        .get();

      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });

      return logs;
    } catch (error) {
      console.error('❌ Error fetching audit logs:', error);
      throw error;
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  static async batchUpdateUserProgress(userId, courseId, progressUpdates) {
    try {
      const db = getFirestore();
      const batch = db.batch();

      progressUpdates.forEach(({ lessonId, progressData }) => {
        const docRef = db.collection('progress')
          .doc(userId)
          .collection('courses')
          .doc(courseId)
          .collection('lessons')
          .doc(lessonId);

        batch.set(docRef, {
          ...progressData,
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          last_accessed: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('❌ Error batch updating user progress:', error);
      throw error;
    }
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  static async getUserData(userId) {
    try {
      const db = getFirestore();
      const doc = await db.collection('users').doc(userId).get();

      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      throw error;
    }
  }

  static async updateUserData(userId, userData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('users').doc(userId);

      await docRef.set({
        ...userData,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      throw error;
    }
  }

  static async createUserData(userId, userData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('users').doc(userId);

      await docRef.set({
        ...userData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error creating user data:', error);
      throw error;
    }
  }
}

module.exports = FirestoreService;
