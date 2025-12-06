const { getFirestore } = require('./firebaseAdmin');
const admin = require('firebase-admin');

class FirestoreService {
  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  static async enrichCourseWithInstructor(course) {
    if (!course || !course.instructor_id) {
      return course;
    }

    try {
      const db = getFirestore();
      const instructorDoc = await db.collection('instructors').doc(course.instructor_id).get();

      if (instructorDoc.exists) {
        const instructorData = instructorDoc.data();
        return {
          ...course,
          instructor: {
            id: course.instructor_id,
            name: instructorData.name || 'Unknown Instructor',
            title: instructorData.title || 'Instructor',
            image: instructorData.image || '/images/placeholder-avatar.jpg',
            bio: instructorData.bio || 'Experienced instructor',
            email: instructorData.email || 'instructor@forwardafrica.com',
            expertise: instructorData.expertise || ['Education'],
            experience: instructorData.experience || 5,
            createdAt: instructorData.createdAt || instructorData.created_at
          },
          instructor_name: instructorData.name,
          instructor_title: instructorData.title,
          instructor_image: instructorData.image,
          instructor_bio: instructorData.bio,
          instructor_email: instructorData.email,
          instructor_expertise: JSON.stringify(instructorData.expertise || ['Education']),
          instructor_experience: instructorData.experience,
          instructor_created_at: instructorData.createdAt || instructorData.created_at
        };
      }
    } catch (error) {
      console.error('⚠️ Error enriching course with instructor data:', error);
    }

    return course;
  }

  static async enrichCoursesWithInstructors(courses) {
    return Promise.all(courses.map(course => this.enrichCourseWithInstructor(course)));
  }

  // ============================================================================
  // COURSES
  // ============================================================================

  /**
   * Get courses with optional pagination
   * @param {number} limitCount - Maximum number of courses to fetch
   * @param {string|null} lastDocId - Document ID for pagination cursor
   * @returns {Promise<Array>} Array of courses
   */
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

      return this.enrichCoursesWithInstructors(courses);
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
        const course = { id: doc.id, ...doc.data() };
        
        // Fetch lessons from the subcollection
        try {
          let lessonsSnapshot;
          try {
            // Try to fetch with orderBy first
            lessonsSnapshot = await db.collection('courses')
              .doc(courseId)
              .collection('lessons')
              .orderBy('order', 'asc')
              .get();
          } catch (orderByError) {
            // If orderBy fails (e.g., missing index), fetch without ordering
            console.warn('⚠️ orderBy failed, fetching lessons without ordering:', orderByError.message);
            lessonsSnapshot = await db.collection('courses')
              .doc(courseId)
              .collection('lessons')
              .get();
          }
          
          const lessons = [];
          lessonsSnapshot.forEach(lessonDoc => {
            lessons.push({ 
              id: lessonDoc.id, 
              ...lessonDoc.data(),
              course_id: courseId
            });
          });
          
          // Sort lessons by order field if orderBy wasn't used
          if (lessons.length > 0 && !lessons[0].hasOwnProperty('order')) {
            // If no order field, keep original order
          } else {
            lessons.sort((a, b) => {
              const orderA = a.order || 0;
              const orderB = b.order || 0;
              return orderA - orderB;
            });
          }
          
          course.lessons = lessons;
        } catch (lessonsError) {
          console.warn('⚠️ Error fetching lessons for course:', lessonsError);
          // If lessons subcollection doesn't exist or has an error, check if lessons are in course doc
          if (!course.lessons || !Array.isArray(course.lessons)) {
            course.lessons = [];
          }
        }
        
        return this.enrichCourseWithInstructor(course);
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      throw error;
    }
  }

  static async createCourse(courseData) {
    try {
      const db = getFirestore();
      const docRef = db.collection('courses').doc();

      await docRef.set({
        ...courseData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

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

  static async getFeaturedCourses(includeComingSoon = true) {
    try {
      const db = getFirestore();
      let courses = [];
      
      try {
        // Try to use optimized query with filters
        let query = db.collection('courses')
          .where('featured', '==', true);

        // Only filter out coming_soon if includeComingSoon is false
        if (!includeComingSoon) {
          query = query.where('coming_soon', '==', false);
        }

        const snapshot = await query
          .orderBy('created_at', 'desc')
          .limit(10)
          .get();

        snapshot.forEach(doc => {
          courses.push({ id: doc.id, ...doc.data() });
        });
      } catch (queryError) {
        // If query fails (e.g., missing index), fall back to fetching all featured and filtering in memory
        console.warn('⚠️ Featured courses query failed, using fallback method:', queryError.message);
        
        const snapshot = await db.collection('courses')
          .where('featured', '==', true)
          .get();

        courses = [];
        snapshot.forEach(doc => {
          const courseData = { id: doc.id, ...doc.data() };
          // Filter in memory if needed
          if (!includeComingSoon && (courseData.coming_soon === true || courseData.coming_soon === 1)) {
            return; // Skip coming soon courses
          }
          courses.push(courseData);
        });

        // Sort by created_at in memory
        courses.sort((a, b) => {
          const aDate = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
          const bDate = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
          return bDate - aDate; // Descending order
        });

        // Limit to 10
        courses = courses.slice(0, 10);
      }

      return this.enrichCoursesWithInstructors(courses);
    } catch (error) {
      console.error('❌ Error fetching featured courses:', error);
      throw error;
    }
  }

  static async getAllCourses(includeComingSoon = true) {
    try {
      const db = getFirestore();
      let q = db.collection('courses').orderBy('created_at', 'desc');

      if (!includeComingSoon) {
        q = db.collection('courses')
          .where('coming_soon', '==', false)
          .orderBy('created_at', 'desc');
      }

      const snapshot = await q.get();
      const courses = [];
      snapshot.forEach(doc => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      return this.enrichCoursesWithInstructors(courses);
    } catch (error) {
      console.error('❌ Error fetching all courses:', error);
      throw error;
    }
  }

  static async getCoursesByInstructor(instructorId, includeComingSoon = true) {
    try {
      const db = getFirestore();
      let q = db.collection('courses')
        .where('instructor_id', '==', instructorId)
        .orderBy('created_at', 'desc');

      if (!includeComingSoon) {
        q = db.collection('courses')
          .where('instructor_id', '==', instructorId)
          .where('coming_soon', '==', false)
          .orderBy('created_at', 'desc');
      }

      const snapshot = await q.get();
      const courses = [];
      snapshot.forEach(doc => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      return this.enrichCoursesWithInstructors(courses);
    } catch (error) {
      console.error('❌ Error fetching courses by instructor:', error);
      throw error;
    }
  }

  static async getCoursesByCategory(category, includeComingSoon = true) {
    try {
      const db = getFirestore();
      let q = db.collection('courses')
        .where('category_name', '==', category)
        .orderBy('created_at', 'desc');

      if (!includeComingSoon) {
        q = db.collection('courses')
          .where('category_name', '==', category)
          .where('coming_soon', '==', false)
          .orderBy('created_at', 'desc');
      }

      const snapshot = await q.get();
      const courses = [];
      snapshot.forEach(doc => {
        courses.push({ id: doc.id, ...doc.data() });
      });

      return this.enrichCoursesWithInstructors(courses);
    } catch (error) {
      console.error('❌ Error fetching courses by category:', error);
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
      console.error('❌ Error marking lesson complete:', error);
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

  static async createCategory(categoryData) {
    try {
      const db = getFirestore();
      const categoryId = categoryData.id || categoryData.name.toLowerCase().replace(/\s+/g, '-');

      const category = {
        name: categoryData.name,
        id: categoryId,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('categories').doc(categoryId).set(category);
      return { id: categoryId, ...category };
    } catch (error) {
      console.error('❌ Error creating category:', error);
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

      // Normalize field names - ensure both variants are written
      const normalizedData = { ...userData };
      if (userData.full_name) {
        normalizedData.full_name = userData.full_name;
        normalizedData.displayName = userData.full_name;
      } else if (userData.displayName) {
        normalizedData.displayName = userData.displayName;
        normalizedData.full_name = userData.displayName;
      }

      if (userData.avatar_url) {
        normalizedData.avatar_url = userData.avatar_url;
        normalizedData.photoURL = userData.avatar_url;
      } else if (userData.photoURL) {
        normalizedData.photoURL = userData.photoURL;
        normalizedData.avatar_url = userData.photoURL;
      }

      await docRef.set({
        ...normalizedData,
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

      // Normalize field names - ensure both variants are written
      const normalizedData = { ...userData };
      if (userData.full_name) {
        normalizedData.full_name = userData.full_name;
        normalizedData.displayName = userData.full_name;
      } else if (userData.displayName) {
        normalizedData.displayName = userData.displayName;
        normalizedData.full_name = userData.displayName;
      }

      if (userData.avatar_url) {
        normalizedData.avatar_url = userData.avatar_url;
        normalizedData.photoURL = userData.avatar_url;
      } else if (userData.photoURL) {
        normalizedData.photoURL = userData.photoURL;
        normalizedData.avatar_url = userData.photoURL;
      }

      await docRef.set({
        ...normalizedData,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error creating user data:', error);
      throw error;
    }
  }

  static async getUsers() {
    try {
      const db = getFirestore();
      const snapshot = await db.collection('users')
        .orderBy('created_at', 'desc')
        .get();

      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return users;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  static async getPlatformStats() {
    try {
      const db = getFirestore();

      const usersSnapshot = await db.collection('users').get();
      const coursesSnapshot = await db.collection('courses').get();
      const instructorsSnapshot = await db.collection('instructors').get();
      const certificatesSnapshot = await db.collection('certificates').get();

      const totalUsers = usersSnapshot.size;
      const totalCourses = coursesSnapshot.size;
      const totalInstructors = instructorsSnapshot.size;
      const totalCertificates = certificatesSnapshot.size;

      let activeUsers = 0;
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.onboardingCompleted || userData.last_login) {
          activeUsers++;
        }
      });

      return {
        totalUsers,
        totalCourses,
        totalInstructors,
        totalCertificates,
        activeUsers,
        completedCourses: totalCertificates,
        totalLessons: 0,
        totalXP: 0
      };
    } catch (error) {
      console.error('❌ Error fetching platform stats:', error);
      throw error;
    }
  }
}

module.exports = FirestoreService;
