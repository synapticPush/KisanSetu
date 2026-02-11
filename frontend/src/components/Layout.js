import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useOptimizedLanguage } from '../hooks/useOptimizedLanguage';
import { getPageTranslations } from '../utils/translationHelpers';
import Sidebar from './Sidebar';
import { FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const { t } = useOptimizedLanguage();

  // Get page translations
  const pageTranslations = getPageTranslations(location.pathname, t);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setIsCollapsed(false); // On mobile, we don't use collapsed state the same way
      } else {
        setSidebarOpen(true);
        setIsCollapsed(true); // Default to collapsed on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      // On desktop, auto-collapse when route changes (navigation)
      setIsCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsCollapsed(true);
    }
  };

  const mainContentClasses = `
    flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out
    ml-0 lg:ml-20
  `;

  return (
    <div className="min-h-screen bg-earth-50 bg-hero-pattern flex">
      {/* Desktop Backdrop Blur */}
      {!isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300 animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Main Content */}
      <div className={mainContentClasses}>
        {/* Top Navigation Bar - Glassmorphism */}
        <header className="glass-panel sticky top-0 z-30 mx-4 mt-4 rounded-xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between transition-all duration-300 flex-shrink-0">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-earth-600 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors lg:hidden"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>

            {/* Desktop collapse button placed here if sidebar is closed (optional, but handling inside sidebar usually better) */}

            {/* Page Title for Desktop */}
            <div className={`hidden sm:block ${isMobile ? 'ml-4' : ''}`}>
              <h1 className="text-xl font-bold text-earth-900 tracking-tight">
                {pageTranslations.title}
              </h1>
              {pageTranslations.subtitle && (
                <p className="text-sm text-earth-500 font-medium">
                  {pageTranslations.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Profile/Actions */}
          <div className="flex items-center space-x-4">
            {/* Placeholder for future header actions like notifications */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in custom-scrollbar">
          {/* Mobile page title */}
          <div className="sm:hidden mb-6">
            <h1 className="text-2xl font-bold text-earth-900">
              {pageTranslations.title}
            </h1>
            {pageTranslations.subtitle && (
              <p className="text-sm text-earth-600 mt-1">
                {pageTranslations.subtitle}
              </p>
            )}
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
