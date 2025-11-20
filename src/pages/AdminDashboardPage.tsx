import React, { useEffect, useState } from "react";
import { useNavigate } from "../lib/router";
import { BarChart2, BookOpen, Users, TrendingUp, Activity, UserPlus, Plus, Settings, Shield, Crown, Database, MessageSquare, DollarSign, Globe, Lock, FileText, Bell, Calendar, Target, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../contexts/PermissionContext";
import { useAnalytics, useUsers } from "../hooks/useDatabase";
import Layout from "../components/layout/Layout";

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <BarChart2 className="h-5 w-5 mr-1" /> },
  { to: "/admin/courses", label: "Courses", icon: <BookOpen className="h-5 w-5 mr-1" /> },
  { to: "/admin/instructors", label: "Instructors", icon: <Users className="h-5 w-5 mr-1" /> },
  { to: "/admin/analytics", label: "Analytics", icon: <TrendingUp className="h-5 w-5 mr-1" /> },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: <Activity className="h-5 w-5 mr-1" /> },
  { to: "/admin/manage-users", label: "Users", icon: <Users className="h-5 w-5 mr-1" /> },
  { to: "/admin/security-settings", label: "Security", icon: <Shield className="h-5 w-5 mr-1" /> },
];

// Super Admin exclusive navigation
const superAdminNav = [
  { to: "/admin/system-configuration", label: "System Config", icon: <Settings className="h-5 w-5 mr-1" /> },
  { to: "/admin/financial-management", label: "Financial", icon: <DollarSign className="h-5 w-5 mr-1" /> },
  { to: "/admin/communication-center", label: "Communication", icon: <MessageSquare className="h-5 w-5 mr-1" /> },
  { to: "/admin/security-center", label: "Security Center", icon: <Lock className="h-5 w-5 mr-1" /> },
  { to: "/admin/database-management", label: "Database", icon: <Database className="h-5 w-5 mr-1" /> },
  { to: "/admin/global-settings", label: "Global Settings", icon: <Globe className="h-5 w-5 mr-1" /> },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { userRole, hasPermission } = usePermissions();
  const [isClient, setIsClient] = useState(false);

  // Database hooks
  const {
    stats: platformStats,
    loading: statsLoading,
    fetchPlatformStats
  } = useAnalytics();

  const {
    users,
    loading: usersLoading,
    fetchAllUsers
  } = useUsers();

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (!isClient) return;

    fetchPlatformStats();
    fetchAllUsers();
  }, [fetchPlatformStats, fetchAllUsers, isClient]);

  function getDisplayName(role: string): string {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'admin': return 'Administrator';
      case 'content_manager': return 'Content Manager';
      default: return 'User';
    }
  }

  // Calculate active users (users who have completed at least one course)
  const activeUsers = users.filter(user => user.onboardingCompleted).length;

  // Check if user is super admin
  const isSuperAdmin = userRole === 'Super Admin';

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="min-h-screen flex bg-gray-900 text-white pt-20">
        <div className="flex items-center justify-center h-64 w-full">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="text-white text-lg">Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex bg-gray-900 text-white pt-20">
      {/* Admin Nav */}
      <nav className="flex space-x-8 border-b border-gray-800 bg-[#181c23] px-8 pt-6 overflow-x-auto">
        {adminNav.map((item) => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className="flex items-center pb-2 text-sm font-medium transition-colors text-gray-400 hover:text-white whitespace-nowrap"
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {/* Super Admin Navigation */}
        {isSuperAdmin && (
          <>
            <div className="border-l border-gray-700 mx-4"></div>
            {superAdminNav.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="flex items-center pb-2 text-sm font-medium transition-colors text-purple-400 hover:text-purple-300 whitespace-nowrap"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage courses, instructors, and platform settings</p>
          {isSuperAdmin && (
            <div className="flex items-center mt-2">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-yellow-400 text-sm font-medium">Super Administrator - Full System Access</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-white font-medium">{userRole === 'super_admin' ? 'Super Administrator' : userRole === 'content_manager' ? 'Content Manager' : 'Administrator'}</p>
            <p className="text-gray-400 text-sm">{user?.email || profile?.email || 'admin@forwardafrica.com'}</p>
          </div>
          <button
            className="bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600"
            onClick={() => navigate('/admin/profile')}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8 py-4">
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-white">
            {statsLoading ? '...' : (platformStats?.totalUsers || users.length)}
          </span>
          <span className="text-gray-400 text-sm mt-2">Total Students</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-white">
            {usersLoading ? '...' : activeUsers}
          </span>
          <span className="text-gray-400 text-sm mt-2">Active Students</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-white">
            {statsLoading ? '...' : (platformStats?.totalCourses || 0)}
          </span>
          <span className="text-gray-400 text-sm mt-2">Total Courses</span>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
          <span className="text-2xl font-bold text-white">
            {statsLoading ? '...' : (platformStats?.totalInstructors || 0)}
          </span>
          <span className="text-gray-400 text-sm mt-2">Total Instructors</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg mx-8 my-6 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold flex items-center"
            onClick={() => navigate("/admin/upload-course")}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Course
          </button>
          <button
            className="border border-gray-500 text-white px-6 py-2 rounded font-semibold flex items-center hover:bg-gray-700"
            onClick={() => {
              console.log('Add Instructor button clicked (dashboard)');
              console.log('Current user role:', userRole);

              // Check if user has permission using the proper hasPermission utility
              const hasInstructorCreatePermission = hasPermission('instructors:create');

              console.log('Has instructor:create permission:', hasInstructorCreatePermission);

              if (!hasInstructorCreatePermission) {
                alert('You do not have permission to create instructors. Please contact an administrator.');
                return;
              }

              navigate("/admin/add-instructor");
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" /> Add Instructor
          </button>
          <button
            className="border border-gray-500 text-white px-6 py-2 rounded font-semibold flex items-center hover:bg-gray-700"
            onClick={() => navigate("/admin/create-user")}
          >
            <Shield className="h-4 w-4 mr-2" /> Create Admin
          </button>
          <button
            className="border border-gray-500 text-white px-6 py-2 rounded font-semibold flex items-center hover:bg-gray-700"
            onClick={() => navigate("/admin/manage-users")}
          >
            <Users className="h-4 w-4 mr-2" /> Manage Users
          </button>
          <button
            className="border border-gray-500 text-white px-6 py-2 rounded font-semibold flex items-center hover:bg-gray-700"
            onClick={() => navigate("/admin/security-settings")}
          >
            <Settings className="h-4 w-4 mr-2" /> Settings
          </button>
        </div>
      </div>

      {/* Super Admin Exclusive Features */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg mx-8 my-6 p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-500" />
            Super Admin Controls
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-3 rounded font-semibold flex flex-col items-center border border-purple-500/30"
              onClick={() => navigate("/admin/system-configuration")}
            >
              <Settings className="h-5 w-5 mb-2" />
              <span className="text-xs">System Config</span>
            </button>
            <button
              className="bg-green-600/20 hover:bg-green-600/30 text-green-300 px-4 py-3 rounded font-semibold flex flex-col items-center border border-green-500/30"
              onClick={() => navigate("/admin/financial-management")}
            >
              <DollarSign className="h-5 w-5 mb-2" />
              <span className="text-xs">Financial Mgmt</span>
            </button>
            <button
              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-3 rounded font-semibold flex flex-col items-center border border-blue-500/30"
              onClick={() => navigate("/admin/communication-center")}
            >
              <MessageSquare className="h-5 w-5 mb-2" />
              <span className="text-xs">Communication</span>
            </button>
            <button
              className="bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-3 rounded font-semibold flex flex-col items-center border border-red-500/30"
              onClick={() => navigate("/admin/security-center")}
            >
              <Lock className="h-5 w-5 mb-2" />
              <span className="text-xs">Security Center</span>
            </button>
            <button
              className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 px-4 py-3 rounded font-semibold flex flex-col items-center border border-yellow-500/30"
              onClick={() => navigate("/admin/database-management")}
            >
              <Database className="h-5 w-5 mb-2" />
              <span className="text-xs">Database Mgmt</span>
            </button>
            <button
              className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 px-4 py-3 rounded font-semibold flex flex-col items-center border border-indigo-500/30"
              onClick={() => navigate("/admin/global-settings")}
            >
              <Globe className="h-5 w-5 mb-2" />
              <span className="text-xs">Global Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* System Health Overview */}
      <div className="mx-8 mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-500" />
          System Health Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-300 text-sm">Database Status</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-green-200 text-xs mt-1">Connected & Healthy</p>
          </div>
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">API Status</span>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-blue-200 text-xs mt-1">All Services Operational</p>
          </div>
          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-300 text-sm">Security Status</span>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-yellow-200 text-xs mt-1">Monitoring Active</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mx-8 mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Security Activity</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-gray-900 rounded px-4 py-2">
            <span>super admin login superadmin@forwardafrica.com</span>
            <span className="bg-gray-700 text-xs px-3 py-1 rounded font-semibold">ADMIN LOGIN</span>
          </div>
          <div className="flex justify-between items-center bg-gray-900 rounded px-4 py-2">
            <span>admin login admin@forwardafrica.com</span>
            <span className="bg-gray-700 text-xs px-3 py-1 rounded font-semibold">ADMIN LOGIN</span>
          </div>
          {/* Add more activity rows as needed */}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#181c23] border-t border-gray-800 pt-10 pb-6 px-8 mt-8">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-red-600 font-bold text-xl mb-2">FORWARDAFRICA</div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering African professionals through expert-led courses and cutting-edge learning experiences.
            </p>
            <div className="flex space-x-3">
              {/* Social icons here */}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Quick Links</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>Browse Courses</li>
              <li>Akira Ai</li>
              <li>Forums</li>
              <li>About Us</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Categories</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>Business</li>
              <li>Entrepreneurship</li>
              <li>Finance</li>
              <li>Personal Development</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Contact Us</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>123 Innovation Hub, Digital City, Africa</li>
              <li>+234 123 456 7890</li>
              <li>Support@forwardafrica.tech</li>
            </ul>
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto mt-8 flex flex-col md:flex-row items-center justify-between">
          <form className="flex items-center w-full md:w-auto mb-4 md:mb-0">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-l bg-gray-700 text-white border-none focus:ring-2 focus:ring-red-500"
            />
            <button className="bg-[#ef4444] hover:bg-[#dc2626] px-4 py-2 rounded-r text-white font-medium">
              Subscribe
            </button>
          </form>
          <div className="text-gray-500 text-xs mt-4 md:mt-0">
            © 2025 Forward Africa. All rights reserved. | Terms of Service | Privacy Policy | Cookie Policy | Accessibility | Admin Login
          </div>
        </div>
      </footer>
    </div>
    </Layout>
  );
}
