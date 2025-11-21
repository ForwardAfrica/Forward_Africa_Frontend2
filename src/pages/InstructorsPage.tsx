import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, BookOpen, Users, Loader2, X, MapPin, Briefcase, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from '../lib/router';
import { usePermissions } from '../contexts/PermissionContext';
import PermissionGuard from '../components/ui/PermissionGuard';
import ErrorMessage from '../components/ui/ErrorMessage';
import Layout from '../components/layout/Layout';
import Image from 'next/image';
import { Instructor } from '../types';
import { instructorAPI } from '../lib/api';

interface InstructorData extends Instructor {
  coursesCount?: number;
  studentsCount?: number;
}

const InstructorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'courses'>('name');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user has permission to manage instructors
  const canViewInstructors = hasPermission('instructors:view');
  const canCreateInstructors = hasPermission('instructors:create');
  const canDeleteInstructors = hasPermission('instructors:delete');
  const canEditInstructors = hasPermission('instructors:edit');

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Fetch instructors from API
  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorAPI.getAllInstructors();
      
      // Add default values for missing properties
      const instructorsWithDefaults = (data || []).map((instructor: any) => ({
        id: instructor.id || '',
        name: instructor.name || 'Unknown',
        title: instructor.title || '',
        email: instructor.email || '',
        phone: instructor.phone || '',
        bio: instructor.bio || '',
        image: instructor.image || '',
        experience: instructor.experience || 0,
        expertise: instructor.expertise || [],
        socialLinks: instructor.socialLinks || { linkedin: '', twitter: '', website: '' },
        createdAt: instructor.createdAt ? new Date(instructor.createdAt) : new Date(),
        coursesCount: Math.floor(Math.random() * 10), // Placeholder
        studentsCount: Math.floor(Math.random() * 500) // Placeholder
      }));

      setInstructors(instructorsWithDefaults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load instructors';
      setError(errorMessage);
      console.error('Error fetching instructors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canViewInstructors) {
      fetchInstructors();
    }
  }, [canViewInstructors, fetchInstructors]);

  // Search and filter instructors
  const filteredInstructors = instructors.filter(instructor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      instructor.name.toLowerCase().includes(searchLower) ||
      instructor.email.toLowerCase().includes(searchLower) ||
      instructor.title.toLowerCase().includes(searchLower) ||
      (instructor.expertise && instructor.expertise.some(e => e.toLowerCase().includes(searchLower)))
    );
  });

  // Sort instructors
  const sortedInstructors = [...filteredInstructors].sort((a, b) => {
    switch (sortBy) {
      case 'email':
        return a.email.localeCompare(b.email);
      case 'courses':
        return (b.coursesCount || 0) - (a.coursesCount || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Handle delete
  const handleDelete = async () => {
    if (!selectedInstructor || !canDeleteInstructors) return;

    try {
      setIsDeleting(true);
      setError(null);
      
      await instructorAPI.deleteInstructor(selectedInstructor.id);
      
      // Remove from list
      setInstructors(instructors.filter(i => i.id !== selectedInstructor.id));
      setShowDeleteModal(false);
      setSelectedInstructor(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete instructor';
      setError(errorMessage);
      console.error('Error deleting instructor:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!canViewInstructors) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 text-white pt-20 px-8">
          <ErrorMessage message="You do not have permission to view instructors." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white pt-20 px-8 pb-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Instructors Management</h1>
            <p className="text-gray-400">Manage platform instructors and their information</p>
          </div>
          {canCreateInstructors && (
            <button
              onClick={() => navigate('/admin/add-instructor')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Instructor
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-600/20 border border-red-500 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-300 font-semibold mb-1">Error</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Search Bar and Filters */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, title, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none placeholder-gray-400"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'courses')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
              >
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="courses">Sort by Courses</option>
              </select>
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Found {sortedInstructors.length} instructor{sortedInstructors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-red-500 animate-spin mr-3" />
            <span className="text-gray-400">Loading instructors...</span>
          </div>
        ) : sortedInstructors.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No instructors found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first instructor'}
            </p>
            {canCreateInstructors && !searchTerm && (
              <button
                onClick={() => navigate('/admin/add-instructor')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Instructor
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedInstructors.map((instructor) => (
              <div key={instructor.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {instructor.image && (
                      <div className="flex-shrink-0">
                        <Image
                          src={instructor.image}
                          alt={instructor.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{instructor.name}</h3>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center text-gray-300 text-sm">
                          <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                          {instructor.title || 'No title'}
                        </div>
                        <div className="flex items-center text-gray-300 text-sm">
                          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                          {instructor.email}
                        </div>
                        {instructor.phone && (
                          <div className="text-gray-400 text-sm">Phone: {instructor.phone}</div>
                        )}
                        {instructor.expertise && instructor.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {instructor.expertise.map((exp, idx) => (
                              <span
                                key={idx}
                                className="bg-red-600/20 text-red-300 px-2 py-1 rounded text-xs"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col gap-4 ml-4 md:ml-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Courses</p>
                      <p className="text-2xl font-bold text-white">{instructor.coursesCount || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Students</p>
                      <p className="text-2xl font-bold text-white">{instructor.studentsCount || 0}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4 md:ml-8">
                    {canEditInstructors && (
                      <button
                        onClick={() => navigate(`/admin/add-instructor?id=${instructor.id}`)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                        title="Edit instructor"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    )}
                    {canDeleteInstructors && (
                      <button
                        onClick={() => {
                          setSelectedInstructor(instructor);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        title="Delete instructor"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedInstructor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Instructor</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete <strong>{selectedInstructor.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedInstructor(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InstructorsPage;
