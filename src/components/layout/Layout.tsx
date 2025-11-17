import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  /** Child components to render in the main content area */
  children: React.ReactNode;
}

/**
 * Layout Component
 *
 * Provides the main application layout structure including:
 * - Fixed header with navigation
 * - Main content area with proper spacing
 * - Footer with site information
 *
 * The layout ensures:
 * - Minimum viewport height
 * - Proper spacing below fixed header
 * - Consistent background colors
 * - Flexible content area that grows to fill available space
 * - Automatic scroll to top on route changes
 *
 * @param {LayoutProps} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 * @returns {JSX.Element} The layout component
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Scroll to top when layout mounts (new page loads)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-brand-background">
      {/* Fixed header */}
      <Header />

      {/* Main content area with padding for fixed header */}
      <main className="flex-grow pt-24 md:pt-28">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;