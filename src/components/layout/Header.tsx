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
  const canAccessAdmin = userRole === 'super_admin' || userRole === 'content_manager';

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
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-brand-background/95 backdrop-blur-sm' : 'bg-gradient-to-b from-brand-background/90 via-brand-background/50 to-transparent'
      }`}
    >
      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28">
          {/* Logo */}
          <Link href="/home" className="flex items-center flex-shrink-0">
            <Image
              src="/images/chosen.png"
              alt="Forward Africa Logo"
              width={200}
              height={200}
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/home"
              className="text-white hover:text-brand-primary px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-white hover:text-brand-primary px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5"
            >
              Courses
            </Link>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className="flex items-center text-white hover:text-brand-primary px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5"
              >
                Resources
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isResourcesOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg py-1 border border-gray-700">
                  <Link
                    href="/afri-sage"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Afri-Sage AI
                  </Link>
                  <Link
                    href="/community"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Community
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="text-white hover:text-brand-primary px-3 py-2 text-sm font-medium rounded-md hover:bg-white/5"
            >
              About
            </Link>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-1 lg:space-x-3">
            {user ? (
              <>
                <Link
                  href="/search"
                  className="text-white hover:text-brand-primary p-2 rounded-full hover:bg-white/5"
                >
                  <Search className="h-5 w-5" />
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="text-white hover:text-brand-primary p-2 rounded-full hover:bg-white/5 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-brand-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                    className="flex items-center text-white hover:text-brand-primary p-2 rounded-full hover:bg-white/5 transition-colors"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.full_name || 'User'}
                        width={24}
                        height={24}
                        className="rounded-full object-cover border border-gray-600"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Simple dropdown - no backdrop, no complex logic */}
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 brand-surface rounded-lg shadow-xl py-2 border border-white/10 z-50">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">
                          {profile?.full_name || user?.email || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile Settings
                        </Link>
                        {canAccessAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
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
                className="text-white bg-brand-gradient px-4 py-2 text-sm font-medium rounded-md transition-transform hover:scale-[1.02]"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white hover:text-brand-primary p-2 rounded-full hover:bg-white/5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brand-background/95 backdrop-blur-sm border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/home"
              className="text-white hover:bg-white/5 hover:text-brand-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-white hover:bg-white/5 hover:text-brand-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              Courses
            </Link>
            <Link
              href="/afri-sage"
              className="text-white hover:bg-white/5 hover:text-brand-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              Afri-Sage AI
            </Link>
            <Link
              href="/community"
              className="text-white hover:bg-white/5 hover:text-brand-primary block px-3 py-2 rounded-md text-base font-medium"
            >
              Community
            </Link>
            <Link
              href="/about"
              className="text-white hover:bg-gray-800 hover:text-red-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              About
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="w-full text-left text-white hover:bg-white/5 hover:text-brand-primary block px-3 py-2 rounded-md text-base font-medium"
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
