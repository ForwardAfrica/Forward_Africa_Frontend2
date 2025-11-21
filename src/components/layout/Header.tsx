import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Search, Menu, X, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import NotificationsDropdown from '../ui/NotificationsDropdown';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthEnhanced } from '../../hooks/useAuthEnhanced';
import { usePermissions } from '../../contexts/PermissionContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const { user, profile, enhancedSignOut } = useAuthEnhanced();
  const { userRole } = usePermissions();
  const canAccessAdmin = userRole === 'Super Admin' || userRole === 'Content Manager' || userRole === 'Instructor';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsResourcesOpen(false);
    // Don't reset profile dropdown on location change
  }, [router.pathname]);

  const handleSignOut = async () => {
    await enhancedSignOut();
    // Navigation is now handled by AuthContext
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <header
      className="relative w-full z-50 transition-all duration-300"
    >
      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-24 lg:h-28">
          {/* Logo */}
          <Link href="/home" className="flex items-center flex-shrink-0">
            <Image
              src="/images/chosen2.png"
              alt="Forward Africa Logo"
              width={200}
              height={200}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/home"
              className="text-white hover:text-red-500 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md hover:bg-white/5 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-white hover:text-red-500 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md hover:bg-white/5 transition-colors"
            >
              Courses
            </Link>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className="flex items-center text-white hover:text-red-500 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md hover:bg-white/5 transition-colors"
              >
                Resources
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </button>

              {isResourcesOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 sm:w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700 z-50">
                  <Link
                    href="/afri-sage"
                    className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Akira Ai
                  </Link>
                  <Link
                    href="/community"
                    className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Forums
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="text-white hover:text-red-500 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md hover:bg-white/5 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            {user ? (
              <>
                <Link
                  href="/search"
                  className="text-white hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="text-white hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-white/5 relative transition-colors"
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationsOpen && (
                    <NotificationsDropdown
                      notifications={notifications}
                      onClose={() => setIsNotificationsOpen(false)}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                    />
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center text-white hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-white/5 transition-colors"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    {profile?.avatar_url || profile?.photoURL || profile?.avatarUrl ? (
                      <Image
                        src={profile.avatar_url || profile.photoURL || profile.avatarUrl || '/images/placeholder-avatar.jpg'}
                        alt={profile.full_name || profile.displayName || profile.fullName || 'User'}
                        width={24}
                        height={24}
                        className="rounded-full object-cover border border-gray-600 w-5 h-5 sm:w-6 sm:h-6"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/images/placeholder-avatar.jpg') {
                            target.src = '/images/placeholder-avatar.jpg';
                          }
                        }}
                      />
                    ) : (
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                    <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Simple dropdown - no backdrop, no complex logic */}
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 sm:w-56 brand-surface rounded-lg shadow-xl py-2 border border-white/10 z-50">
                      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-700">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                          {profile?.full_name || profile?.displayName || profile?.fullName || user?.email || 'User'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
                          Profile Settings
                        </Link>
                        {canAccessAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="text-white bg-[#ef4444] hover:bg-[#dc2626] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-transform hover:scale-[1.02]"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-white/5 transition-colors ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-brand-background/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/home"
              className="text-white hover:bg-white/5 hover:text-red-500 block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-white hover:bg-white/5 hover:text-red-500 block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/afri-sage"
              className="text-white hover:bg-white/5 hover:text-red-500 block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors"
            >
              Akira Ai
            </Link>
            <Link
              href="/community"
              className="text-white hover:bg-white/5 hover:text-red-500 block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors"
            >
              Forums
            </Link>
            <Link
              href="/about"
              className="text-white hover:bg-white/5 hover:text-red-500 block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors"
            >
              About
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full text-left text-white hover:bg-white/5 hover:text-red-500 block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
