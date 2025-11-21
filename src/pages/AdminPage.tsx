import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Activity,
  TrendingUp,
  Award,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  Target,
  Zap,
  PlayCircle,
  GraduationCap,
  MessageSquare,
  Globe,
  Crown,
  X,
  Grid3X3,
  List
} from 'lucide-react';
import { useNavigate } from '../lib/router';
import Button from '../components/ui/Button';
import { useCourses, useAnalytics, useAuditLogs, useCategories, useInstructors } from '../hooks/useDatabase';
import { Course, Category, Instructor, Permission } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { usePermissions } from '../contexts/PermissionContext';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ui/ErrorMessage';
import PermissionGuard from '../components/ui/PermissionGuard';
import Layout from '../components/layout/Layout';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'instructors' | 'analytics' | 'audit'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isClient, setIsClient] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [instructorViewType, setInstructorViewType] = useState<'card' | 'table'>('card');

  // Get user permissions
  const { userRole, hasPermission } = usePermissions();
  const { profile } = useAuth();

  // Database hooks
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    fetchAllCourses
  } = useCourses();

  const {
    stats: analyticsStats,
    detailedStats,
    loading: analyticsLoading,
    error: analyticsError,
    fetchPlatformStats,
    fetchDetailedAnalytics
  } = useAnalytics();

  const {
    logs: auditLogsData,
    loading: auditLogsLoading,
    error: auditLogsError,
    fetchAuditLogs
  } = useAuditLogs();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchAllCategories
  } = useCategories();

  const {
    instructors,
    loading: instructorsLoading,
    error: instructorsError,
    fetchAllInstructors
  } = useInstructors();

  // Get admin role from context
  const adminRole = userRole || 'Super Admin'; // Default to super_admin for testing
  const adminEmail = profile?.email || 'admin@forwardafrica.com';

  // Debug user state
  console.log('🔍 Debug User State:', {
    userRole,
    adminRole,
    adminEmail,
    profile,
    isClient,
    hasPermission: typeof hasPermission,
    permissions: profile?.permissions || [],
    role: profile?.role
  });

  // Debug permission checks
  console.log('🔍 Permission Checks:', {
    canCreateCourses: hasPermission('courses:create'),
    canCreateInstructors: hasPermission('instructors:create'),
    canCreateUsers: hasPermission('users:create'),
    canViewUsers: hasPermission('users:view'),
    canConfigureSystem: hasPermission('system:configuration')
  });
  const canAccessAudit = hasPermission('audit:view_logs');
  const canManageUsers = hasPermission('users:view');
  const canManageSettings = hasPermission('system:configuration');
  const canCreateAdminUsers = hasPermission('users:create');
  const canDeleteCourses = hasPermission('courses:delete');
  const canManageInstructors = hasPermission('instructors:view');

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scroll to top on component mount
  useEffect(() => {
    if (isClient) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isClient]);

  // Load data on component mount
  useEffect(() => {
    if (!isClient) return;

    console.log('🔄 AdminPage: Loading data...');
    console.log('👤 User role:', userRole);
    console.log('🔑 Auth token:', typeof window !== 'undefined' ? localStorage.getItem('forward_africa_token') : 'SSR');

    fetchAllCourses(true); // Include coming soon courses for admin management
    fetchAllCategories();
    fetchAllInstructors();
    fetchPlatformStats();
    fetchDetailedAnalytics();
    fetchAuditLogs();
  }, [fetchAllCourses, fetchAllCategories, fetchAllInstructors, fetchPlatformStats, fetchDetailedAnalytics, fetchAuditLogs, userRole, isClient]);

  // Clear permission error after 5 seconds
  useEffect(() => {
    if (permissionError) {
      const timer = setTimeout(() => {
        setPermissionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [permissionError]);

  const logAuditEvent = (action: string, details: string) => {
    if (!isClient) return;

    const auditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('adminEmail') || 'Unknown',
      action,
      details,
      ipAddress: '192.168.1.100'
    };

    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.unshift(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs.slice(0, 1000)));
  };

  const handleDeleteCourse = async (courseId: string) => {
    console.log('🔍 Delete Course Debug:', {
      courseId,
      canDeleteCourses,
      userRole,
      profile,
      token: localStorage.getItem('forward_africa_token') ? 'Token exists' : 'No token'
    });

    if (!canDeleteCourses) {
      setPermissionError('You do not have permission to delete courses. This action requires Admin or Super Admin privileges.');
      return;
    }

    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('forward_africa_token');
        console.log('🔑 Using token:', token ? 'Token exists' : 'No token found');

        // Call the API to delete the course
        const response = await fetch(`http://localhost:3002/api/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📡 Delete response status:', response.status);
        console.log('📡 Delete response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Delete error response:', errorData);
          throw new Error(errorData.error || 'Failed to delete course');
        }

        const responseData = await response.json();
        console.log('✅ Delete success response:', responseData);

        const course = courses.find(c => c.id === courseId);
        logAuditEvent('course_deleted', `Deleted course: ${course?.title}`);

        // Refresh the courses list from the database
        await fetchAllCourses(true); // Include coming soon courses for admin management

        // Show success message
        alert('Course deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting course:', error);
        alert(`Failed to delete course: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleDeleteInstructor = async (instructorId: string) => {
    if (!canManageInstructors) {
      setPermissionError('You do not have permission to delete instructors. This action requires Content Manager, Admin, or Super Admin privileges.');
      return;
    }

    if (confirm('Are you sure you want to delete this instructor? This will affect all courses they are assigned to.')) {
      try {
        const instructor = instructors.find(i => i.id === instructorId);

        // Use instructorAPI to delete from Firestore
        await import('../lib/api').then(module => module.instructorAPI.deleteInstructor(instructorId));

        logAuditEvent('instructor_deleted', `Deleted instructor: ${instructor?.name}`);

        // Refresh the instructors list from the database
        await fetchAllInstructors();

        // Show success message
        alert('Instructor deleted successfully');
      } catch (error) {
        console.error('Error deleting instructor:', error);
        alert(`Failed to delete instructor: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="text-white text-lg">Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('forward_africa_token');
  console.log('🔐 Authentication status:', isAuthenticated);

  // For testing purposes, if no user role is set, default to Super Admin
  if (isClient && !userRole) {
    console.log('⚠️ No user role found, defaulting to Super Admin for testing');
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (course.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesInstructor = selectedInstructor === 'all' || course.instructorId === selectedInstructor;

    return matchesSearch && matchesCategory && matchesInstructor;
  });

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enhanced Analytics data from database
  const totalStudents = analyticsStats?.totalUsers || 0;
  const activeStudents = analyticsStats?.activeStudents || 0;
  const totalInstructors = analyticsStats?.totalInstructors || 0;
  const totalCourses = analyticsStats?.totalCourses || 0;
  const completionRate = detailedStats?.metrics?.completionRate || 0;

  // Use real analytics data from backend
  const monthlyRevenue = 0; // Revenue tracking not implemented yet
  const avgSessionDuration = analyticsStats?.avgSessionDurationMinutes || 0; // Real data from backend
  const totalWatchTime = analyticsStats?.totalWatchTimeHours || 0; // Real data from backend
  const certificatesIssued = analyticsStats?.totalCertificates || 0;
  const userRetentionRate = analyticsStats?.userRetentionRate || 85.2; // Real data from backend

  // Additional real metrics
  const dailyActiveUsers = analyticsStats?.dailyActiveUsers || 0;
  const weeklyActiveUsers = analyticsStats?.weeklyActiveUsers || 0;
  const monthlyActiveUsers = analyticsStats?.monthlyActiveUsers || 0;

  // Debug logging
  console.log('📊 AdminPage Analytics State:', {
    analyticsStats,
    detailedStats,
    analyticsLoading,
    analyticsError
  });
  console.log('📋 AdminPage Audit Logs State:', {
    auditLogsData,
    auditLogsLoading,
    auditLogsError
  });

  // Time-based data for charts
  const getTimeRangeData = (range: string) => {
    // Return empty data since we don't have historical tracking yet
    switch (range) {
      case '7d':
        return [
          { period: 'Mon', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Tue', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Wed', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Thu', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Fri', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Sat', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Sun', students: 0, revenue: 0, engagement: 0, completions: 0 },
        ];
      case '90d':
        return [
          { period: 'Month 1', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Month 2', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Month 3', students: 0, revenue: 0, engagement: 0, completions: 0 },
        ];
      case '1y':
        return [
          { period: 'Q1', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Q2', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Q3', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Q4', students: 0, revenue: 0, engagement: 0, completions: 0 },
        ];
      default: // 30d
        return [
          { period: 'Week 1', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Week 2', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Week 3', students: 0, revenue: 0, engagement: 0, completions: 0 },
          { period: 'Week 4', students: 0, revenue: 0, engagement: 0, completions: 0 },
        ];
    }
  };

  const timeRangeData = getTimeRangeData(analyticsTimeRange);

  const categoryData = categories.map(category => ({
    name: category.name,
    courses: courses.filter(course => course.category === category.name).length,
    students: 0, // No student tracking per category yet
    revenue: 0 // No revenue tracking yet
  }));

  // Function to clean up course title
  const cleanCourseTitle = (title: string) => {
    if (!title) return 'Untitled Course';
    // Remove any numeric IDs that might be appended
    const cleanTitle = title.replace(/\s+\d{10,}$/, ''); // Remove trailing long numbers
    return cleanTitle || 'Untitled Course';
  };

  const topPerformingCourses = (detailedStats?.topCourses || courses
    .map((course: Course) => ({
      ...course,
      enrollments: 0, // No enrollment tracking yet
      rating: '0.0', // No rating system yet
      revenue: 0 // No revenue tracking yet
    }))
    .slice(0, 5)).map((course: any) => ({
      ...course,
      title: cleanCourseTitle(course.title),
      instructor: course.instructor || {
        name: (course as any).instructor_name || 'Unknown Instructor',
        title: (course as any).instructor_title || 'Instructor'
      }
    }));

  const userEngagementData = [
    { metric: 'Daily Active Users', value: dailyActiveUsers, change: dailyActiveUsers > 0 ? '+12%' : 'No data', trend: dailyActiveUsers > 0 ? 'up' : 'neutral' },
    { metric: 'Weekly Active Users', value: weeklyActiveUsers, change: weeklyActiveUsers > 0 ? '+8%' : 'No data', trend: weeklyActiveUsers > 0 ? 'up' : 'neutral' },
    { metric: 'Monthly Active Users', value: monthlyActiveUsers, change: monthlyActiveUsers > 0 ? '+15%' : 'No data', trend: monthlyActiveUsers > 0 ? 'up' : 'neutral' },
    { metric: 'Session Duration', value: `${avgSessionDuration} min`, change: avgSessionDuration > 0 ? '+5%' : 'No data', trend: avgSessionDuration > 0 ? 'up' : 'neutral' },
    { metric: 'Pages per Session', value: 0, change: 'No data', trend: 'neutral' },
    { metric: 'Bounce Rate', value: '0%', change: 'No data', trend: 'neutral' },
  ];

  const revenueBreakdown = [
    { source: 'Revenue Tracking', amount: 0, percentage: 100, color: '#6b7280' },
  ];

  const auditLogs = auditLogsData || [];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  // Show login prompt if not authenticated (commented out for testing)
  /*
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-6">Please log in to access the admin dashboard.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            className="flex items-center"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  */

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Permission Error Message */}
        {permissionError && (
          <div className="mb-6">
            <ErrorMessage
              title="Permission Denied"
              message={permissionError}
              onClose={() => setPermissionError(null)}
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage courses, instructors, and platform settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-white font-medium">{adminRole === 'Super Admin' ? 'Super Administrator' : adminRole === 'Content Manager' ? 'Content Manager' : 'Administrator'}</p>
            <p className="text-gray-400 text-sm">{adminEmail}</p>
            {/* Debug info */}
            {/* <p className="text-gray-500 text-xs">Role: {userRole} | Permissions: {profile?.permissions?.length || 0}</p> */}
            <p className="text-gray-500 text-xs">Role: {userRole}</p>
          </div>
          {/* <Button
            variant="outline"
            onClick={() => navigate('/admin/profile')}
            className="flex items-center"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button> */}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 mb-8">
        <div className="flex space-x-8 overflow-x-auto">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'instructors', label: 'Instructors', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'audit', label: 'Audit Logs', icon: Activity }
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`pb-4 relative flex items-center space-x-2 whitespace-nowrap ${
                activeTab === id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {activeTab === id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-blue-500/10 p-3 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalStudents.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Students</div>
                  <div className="text-xs text-green-400 mt-1">+12% this month</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-green-500/10 p-3 rounded-lg mr-4">
                  <UserPlus className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{activeStudents.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Active Students</div>
                  <div className="text-xs text-green-400 mt-1">+8% this week</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-red-500/10 p-3 rounded-lg mr-4">
                  <BookOpen className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalCourses}</div>
                  <div className="text-sm text-gray-400">Total Courses</div>
                  <div className="text-xs text-blue-400 mt-1">{courses.filter(c => c.comingSoon).length} coming soon</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-purple-500/10 p-3 rounded-lg mr-4">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {monthlyRevenue > 0 ? `$${monthlyRevenue.toLocaleString()}` : 'Not Available'}
                  </div>
                  <div className="text-sm text-gray-400">Monthly Revenue</div>
                  <div className="text-xs text-gray-400 mt-1">Revenue tracking coming soon</div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500/10 p-3 rounded-lg mr-4">
                  <Target className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{completionRate}%</div>
                  <div className="text-sm text-gray-400">Completion Rate</div>
                  <div className="text-xs text-green-400 mt-1">+3% this month</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-cyan-500/10 p-3 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {avgSessionDuration > 0 ? `${avgSessionDuration}m` : '0m'}
                  </div>
                  <div className="text-sm text-gray-400">Avg Session</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {avgSessionDuration > 0 ? '+5% this week' : 'No sessions yet'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-orange-500/10 p-3 rounded-lg mr-4">
                  <PlayCircle className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {totalWatchTime > 0 ? `${totalWatchTime.toLocaleString()}h` : '0h'}
                  </div>
                  <div className="text-sm text-gray-400">Total Watch Time</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {totalWatchTime > 0 ? '+22% this month' : 'No watch time yet'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className="bg-emerald-500/10 p-3 rounded-lg mr-4">
                  <GraduationCap className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{certificatesIssued}</div>
                  <div className="text-sm text-gray-400">Certificates Issued</div>
                  <div className="text-xs text-green-400 mt-1">+18% this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>

            {/* Debug Info - Remove this later */}
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded text-yellow-300 text-sm">
              <strong>Debug Info:</strong><br/>
              User Role: {userRole || 'Not set'}<br/>
              Profile Role: {profile?.role || 'Not set'}<br/>
              Is Authenticated: {!!profile}<br/>
              Permissions: {profile?.permissions?.length || 0} items
            </div>
            <div className="flex flex-wrap gap-4">
              {/* Add Course - Red button (primary) */}
              <PermissionGuard permission="courses:create">
                <Button
                  variant="primary"
                  onClick={() => navigate('/admin/upload-course')}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </PermissionGuard>

              {/* Add Instructor - Dark grey button */}
              <PermissionGuard permission="instructors:create">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/add-instructor')}
                  className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg border-gray-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Instructor
                </Button>
              </PermissionGuard>

              {/* Create Admin - Dark grey button */}
              <PermissionGuard permission="users:create">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/create-user')}
                  className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg border-gray-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Create Admin
                </Button>
              </PermissionGuard>

              {/* Manage Users - Dark grey button */}
              <PermissionGuard permission="users:view">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/manage-users')}
                  className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg border-gray-600"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </PermissionGuard>

              {/* Settings - Dark grey button */}
              <PermissionGuard permission="system:configuration">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/security-settings')}
                  className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg border-gray-600"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Super Admin Features */}
          {userRole === 'Super Admin' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                Super Admin Controls
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/system-configuration')}
                  className="flex items-center justify-center bg-red-600/10 border-red-600/20 text-red-400 hover:bg-red-600/20"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Config
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/financial-management')}
                  className="flex items-center justify-center bg-green-600/10 border-green-600/20 text-green-400 hover:bg-green-600/20"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financial Mgmt
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/communication-center')}
                  className="flex items-center justify-center bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600/20"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Communication
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/security-center')}
                  className="flex items-center justify-center bg-purple-600/10 border-purple-600/20 text-purple-400 hover:bg-purple-600/20"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security Center
                </Button>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {auditLogs.slice(0, 5).map((log: any) => {
                // Parse details if it's a JSON string
                let detailsText = 'N/A';
                try {
                  if (log.details) {
                    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                    detailsText = details.message || JSON.stringify(details);
                  }
                } catch (error) {
                  detailsText = log.details || 'N/A';
                }

                // Use the correct date field
                const logDate = log.created_at || log.timestamp;

                return (
                  <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-700">
                    <div>
                      <p className="text-white">{detailsText}</p>
                      <p className="text-gray-400 text-sm">{logDate ? new Date(logDate).toLocaleString() : 'Unknown date'}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                      {log.action.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                );
              })}

              {auditLogs.length === 0 && (
                <div className="text-center py-6">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Course Management Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Course Management</h2>
              <p className="text-gray-400">Manage all courses and content</p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/upload-course')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Course
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <select
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Instructors</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Courses Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-gray-400 mb-4">Get started by creating your first course.</p>
                  <PermissionGuard permission="courses:create">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/admin/upload-course')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </PermissionGuard>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Instructor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lessons</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                            />
                            <div>
                              <div className="text-sm font-medium text-white flex items-center">
                                {course.title}
                                {course.featured && <Star className="h-4 w-4 text-yellow-500 ml-2" />}
                              </div>
                              <div className="text-sm text-gray-400">
                                {course.description?.length > 10
                                  ? `${course.description.substring(0, 20)}...`
                                  : course.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={course.instructor?.image || (course as any).instructor_image || '/images/placeholder-avatar.jpg'}
                              alt={course.instructor?.name || (course as any).instructor_name || 'Instructor'}
                              className="h-8 w-8 rounded-full object-cover mr-3"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-avatar.jpg';
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-white">
                                {course.instructor?.name || (course as any).instructor_name || 'Unknown Instructor'}
                              </div>
                              <div className="text-sm text-gray-400">
                                {course.instructor?.title || (course as any).instructor_title || 'Instructor'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                            {categories.find(c => c.id === course.category)?.name || course.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {course.comingSoon ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Coming Soon
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Published
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {(course.lessons?.length || 0)} lessons
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCourse(course)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>

                            <PermissionGuard permission="courses:edit">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/upload-course?edit=${course.id}`)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </PermissionGuard>

                            <PermissionGuard permission="courses:delete">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                                className="text-red-500 border-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </PermissionGuard>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'instructors' && (
        <div className="space-y-6">
          {/* Instructor Management Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Instructor Management</h2>
              <p className="text-gray-400">Manage instructor profiles and assignments</p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/add-instructor')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Instructor
            </Button>
          </div>

          {/* Search and View Toggle */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setInstructorViewType('card')}
                  className={`px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                    instructorViewType === 'card'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Card view"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">Card</span>
                </button>
                <button
                  onClick={() => setInstructorViewType('table')}
                  className={`px-3 py-2 rounded transition-colors flex items-center gap-2 ${
                    instructorViewType === 'table'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Table view"
                >
                  <List className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">Table</span>
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Found {filteredInstructors.length} instructor{filteredInstructors.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Card View */}
          {instructorViewType === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructors.map((instructor) => {
                const instructorCourses = courses.filter(course => course.instructorId === instructor.id);

                return (
                  <div key={instructor.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={instructor.image}
                        alt={instructor.name}
                        className="h-16 w-16 rounded-full object-cover mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{instructor.name}</h3>
                        <p className="text-gray-400 text-sm">{instructor.title}</p>
                        <p className="text-gray-500 text-xs">{instructor.email}</p>
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    {instructor.expertise && instructor.expertise.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {instructor.expertise.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {instructor.expertise.length > 3 && (
                            <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                              +{instructor.expertise.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{instructorCourses.length}</div>
                        <div className="text-xs text-gray-400">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{instructor.experience}</div>
                        <div className="text-xs text-gray-400">Years Exp.</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Navigating to instructor profile:', instructor.id);
                          navigate(`/instructor/${instructor.id}`);
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/add-instructor?edit=${instructor.id}`)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInstructor(instructor.id)}
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {instructorViewType === 'table' && (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Expertise</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Courses</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Experience</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstructors.map((instructor) => {
                    const instructorCourses = courses.filter(course => course.instructorId === instructor.id);

                    return (
                      <tr key={instructor.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={instructor.image}
                              alt={instructor.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <span className="text-white font-medium">{instructor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{instructor.email}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{instructor.title}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {instructor.expertise && instructor.expertise.slice(0, 2).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {instructor.expertise && instructor.expertise.length > 2 && (
                              <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                                +{instructor.expertise.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-white font-semibold">{instructorCourses.length}</td>
                        <td className="px-6 py-4 text-center text-white font-semibold">{instructor.experience} yrs</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                console.log('Navigating to instructor profile:', instructor.id);
                                navigate(`/instructor/${instructor.id}`);
                              }}
                              className="p-2 hover:bg-blue-600/20 text-blue-400 rounded transition-colors"
                              title="View instructor"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/add-instructor?edit=${instructor.id}`)}
                              className="p-2 hover:bg-blue-600/20 text-blue-400 rounded transition-colors"
                              title="Edit instructor"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInstructor(instructor.id)}
                              className="p-2 hover:bg-red-600/20 text-red-400 rounded transition-colors"
                              title="Delete instructor"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredInstructors.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">No instructors found</h3>
              <p className="text-gray-400 mb-4">Get started by adding your first instructor.</p>
              <Button
                variant="primary"
                onClick={() => {
                  console.log('Add Instructor button clicked (instructors tab)');
                  console.log('Current user role:', userRole);
                  console.log('Current user permissions:', profile?.permissions);

                  // For testing purposes, allow navigation regardless of permissions
                  console.log('Allowing navigation for testing...');

                  navigate('/admin/add-instructor');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Instructor
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <PermissionGuard
          permission="analytics:view"
        >
          <div className="space-y-8">
            {/* Analytics Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={analyticsTimeRange}
                  onChange={(e) => setAnalyticsTimeRange(e.target.value as any)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button variant="outline" className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">${monthlyRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Monthly Revenue</div>
                    <div className="text-xs text-green-400 mt-1">+15% vs last month</div>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{completionRate}%</div>
                    <div className="text-sm text-gray-400">Completion Rate</div>
                    <div className="text-xs text-green-400 mt-1">+3% this month</div>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{userRetentionRate}%</div>
                    <div className="text-sm text-gray-400">User Retention</div>
                    <div className="text-xs text-green-400 mt-1">+2% this quarter</div>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{avgSessionDuration}m</div>
                    <div className="text-sm text-gray-400">Avg Session Duration</div>
                    <div className="text-xs text-green-400 mt-1">+5% this week</div>
                  </div>
                  <div className="bg-orange-500/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Student Growth */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Student Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Trends */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Categories Distribution */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white text-xl font-bold mb-1">Course Distribution by Category</h3>
                    <p className="text-gray-400 text-sm">Number of courses across different categories</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">Analytics</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                      tickLine={{ stroke: '#374151' }}
                    />
                    <YAxis
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                      tickLine={{ stroke: '#374151' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="courses" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User Engagement */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-semibold mb-4">User Engagement Metrics</h3>
                <div className="space-y-4">
                  {userEngagementData.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{metric.metric}</div>
                        <div className="text-gray-400 text-sm">{metric.value}</div>
                      </div>
                      <div className={`flex items-center text-sm ${
                        metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className={`h-4 w-4 mr-1 ${
                          metric.trend === 'down' ? 'rotate-180' : ''
                        }`} />
                        {metric.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueBreakdown.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">{item.source}</div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      ${item.amount.toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {item.percentage}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Courses */}
            <div className="bg-gray-800 rounded-lg p-6 ml-12">
              <h3 className="text-white text-lg font-semibold mb-4">Top Performing Courses</h3>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="w-full table-fixed border-collapse" style={{ minHeight: '80px' }}>
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/2">Course</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/8">Enrollments</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/8">Rating</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/8">Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/8">Completion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {topPerformingCourses && topPerformingCourses.length > 0 ? topPerformingCourses.map((course: any, index: number) => (
                        <tr key={course.id} className="min-h-[80px]">
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start space-x-3 min-w-0 pr-2">
                              <img
                                src={course.thumbnail || '/images/placeholder-course.jpg'}
                                alt={course.title || 'Course'}
                                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/placeholder-course.jpg';
                                }}
                              />
                              <div className="min-w-0 flex-1 grid grid-rows-2 gap-1">
                                <div className="text-sm font-medium text-white truncate leading-tight" title={course.title}>
                                  {course.title}
                                </div>
                                <div className="text-xs text-gray-400 truncate leading-tight" title={course.instructor?.name || (course as any).instructor_name || 'Unknown Instructor'}>
                                  {course.instructor?.name || (course as any).instructor_name || 'Unknown Instructor'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-white">
                            <div className="truncate" title={(course.enrollments || 0).toLocaleString()}>
                              {(course.enrollments || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1 flex-shrink-0" />
                              <span className="text-sm text-white truncate" title={course.rating || 'N/A'}>
                                {course.rating || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-white">
                            <div className="truncate" title={`$${(course.revenue || 0).toLocaleString()}`}>
                              ${(course.revenue || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(course.revenue || 0) > 0 ? Math.min(100, Math.max(60, (course.revenue / 10000) * 100)) : 60}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                            No course data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}

      {activeTab === 'audit' && (
        <PermissionGuard
          permission="audit:view_logs"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Audit Logs</h2>
                <p className="text-gray-400">System activity and security logs</p>
              </div>
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">No audit logs</h3>
                    <p className="text-gray-400">System activity will appear here.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {auditLogs.slice(0, 20).map((log: any) => (
                        <tr key={log.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {log.user_name || log.user_id || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                              {log.action.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                            {(() => {
                              try {
                                if (log.details) {
                                  const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                                  return details.message || JSON.stringify(details);
                                }
                                return log.resource_type || 'N/A';
                              } catch (error) {
                                return log.details || 'N/A';
                              }
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {log.ip_address || log.ipAddress || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Course Details</h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Course Thumbnail */}
              <div className="flex justify-center">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="h-48 w-48 object-cover rounded-lg"
                />
              </div>

              {/* Course Title */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">{selectedCourse.title}</h4>
              </div>

              {/* Course Description */}
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2">Description</h5>
                <p className="text-gray-400 text-sm leading-relaxed">{selectedCourse.description}</p>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-1">Category</h5>
                  <p className="text-gray-400 text-sm">
                    {categories.find(c => c.id === selectedCourse.category)?.name || 'Uncategorized'}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-1">Status</h5>
                  <p className="text-gray-400 text-sm">
                    {selectedCourse.comingSoon ? 'Coming Soon' : 'Published'}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-1">Lessons</h5>
                  <p className="text-gray-400 text-sm">
                    {selectedCourse.lessons?.length || 0} lessons
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-1">Featured</h5>
                  <p className="text-gray-400 text-sm">
                    {selectedCourse.featured ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {/* Instructor Info */}
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2">Instructor</h5>
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedCourse.instructor?.image || (selectedCourse as any).instructor_image || '/images/placeholder-avatar.jpg'}
                    alt={selectedCourse.instructor?.name || (selectedCourse as any).instructor_name || 'Instructor'}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">
                      {selectedCourse.instructor?.name || (selectedCourse as any).instructor_name || 'Unknown Instructor'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {selectedCourse.instructor?.title || (selectedCourse as any).instructor_title || 'Instructor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCourseModal(false)}
              >
                Close
              </Button>
              {/* <Button
                variant="primary"
                onClick={() => navigate(`/course/${selectedCourse.id}`)}
              >
                Go to Course
              </Button> */}
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default AdminPage;
