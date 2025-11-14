import React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft } from 'lucide-react';
import StorageManager from '../src/components/ui/StorageManager';
import { useAuth } from '../src/contexts/AuthContext';

export default function StorageManagerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated (using useEffect to avoid synchronous redirect)
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Show loading state while checking authentication
  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Storage Manager</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Local Storage Management
          </h2>
          <p className="text-gray-400">
            Manage your browser's local storage data. You can view, clear, export, and import storage items.
          </p>
        </div>

        <StorageManager showDebugInfo={true} />
      </div>
    </div>
  );
}
