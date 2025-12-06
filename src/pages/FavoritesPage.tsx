import React from 'react';
import Layout from '../components/layout/Layout';
import CourseCard from '../components/ui/CourseCard';
import { useFavorites } from '../hooks/useFavorites';
import { Heart, RefreshCw, BookOpen } from 'lucide-react';
import { useRouter } from 'next/router';

const FavoritesPage: React.FC = () => {
  const router = useRouter();
  const {
    favorites,
    loading,
    error,
    fetchFavorites,
    hasInitialized,
    retryFetch
  } = useFavorites();

  const handleLoadFavorites = async () => {
    await fetchFavorites();
  };

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your favorites...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-3" />
              My Favorites
            </h1>
            <button
              onClick={() => router.push('/learn-later')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span>Learn Later</span>
            </button>
          </div>
          <p className="text-gray-400">Your saved courses and learning materials</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-red-400">{error}</p>
              <button
                onClick={retryFetch}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!hasInitialized ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">Load Your Favorites</h3>
            <p className="text-gray-400 mb-6">Click the button below to load your favorite courses.</p>
            <button
              onClick={handleLoadFavorites}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Load Favorites
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No favorites yet</h3>
            <p className="text-gray-400 mb-4">Start exploring courses and add them to your favorites.</p>
            <button
              onClick={handleLoadFavorites}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Favorites
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((course) => (
              <CourseCard key={course.id} course={course} showFavoriteButton={true} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;