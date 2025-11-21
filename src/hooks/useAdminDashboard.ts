import { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, getDocs, count } from 'firebase/firestore';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalInstructors: number;
  totalCertificates: number;
}

export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalCertificates: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const instructorsSnapshot = await getDocs(collection(db, 'instructors'));
      const certificatesSnapshot = await getDocs(collection(db, 'certificates'));

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

      setStats({
        totalUsers,
        activeUsers,
        totalCourses,
        totalInstructors,
        totalCertificates
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    try {
      const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        let activeCount = 0;
        snapshot.forEach(doc => {
          const userData = doc.data();
          if (userData.onboardingCompleted || userData.last_login) {
            activeCount++;
          }
        });

        setStats(prev => ({
          ...prev,
          totalUsers: snapshot.size,
          activeUsers: activeCount
        }));
      }, (err) => {
        console.warn('Could not set up real-time users listener:', err);
        fetchStats();
      });
      unsubscribes.push(usersUnsubscribe);

      const coursesUnsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
        setStats(prev => ({
          ...prev,
          totalCourses: snapshot.size
        }));
      }, (err) => {
        console.warn('Could not set up real-time courses listener:', err);
        fetchStats();
      });
      unsubscribes.push(coursesUnsubscribe);

      const instructorsUnsubscribe = onSnapshot(collection(db, 'instructors'), (snapshot) => {
        setStats(prev => ({
          ...prev,
          totalInstructors: snapshot.size
        }));
      }, (err) => {
        console.warn('Could not set up real-time instructors listener:', err);
        fetchStats();
      });
      unsubscribes.push(instructorsUnsubscribe);

      const certificatesUnsubscribe = onSnapshot(collection(db, 'certificates'), (snapshot) => {
        setStats(prev => ({
          ...prev,
          totalCertificates: snapshot.size
        }));
      }, (err) => {
        console.warn('Could not set up real-time certificates listener:', err);
        fetchStats();
      });
      unsubscribes.push(certificatesUnsubscribe);

      setLoading(false);
    } catch (err) {
      console.error('Error setting up real-time listeners:', err);
      setError('Failed to set up real-time updates');
      fetchStats();
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

export const useAdminDashboardUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const userData: any[] = [];
        snapshot.forEach(doc => {
          userData.push({ id: doc.id, ...doc.data() });
        });
        setUsers(userData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching users in real-time:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    users,
    loading,
    error
  };
};
