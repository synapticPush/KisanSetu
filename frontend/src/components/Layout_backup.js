import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
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
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isMobile ? 'ml-0' : (sidebarOpen ? (isCollapsed ? 'lg:ml-16' : 'lg:ml-64') : 'lg:ml-0')}
      `}>
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side - Menu button */}
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors lg:hidden"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                </button>

                {/* Desktop collapse button */}
                {!isMobile && (
                  <button
                    onClick={toggleCollapse}
                    className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    aria-label="Toggle sidebar collapse"
                  >
                    {isCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
                  </button>
                )}
              </div>

              {/* Right side - Page title */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {getPageTitle(location.pathname)}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Mobile page title */}
              <div className="sm:hidden mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>

              {/* Page content */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper function to get page title based on route
const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/fields': 'Fields',
    '/money': 'Money Records',
    '/borrowings': 'Borrowings',
    '/lot-numbers': 'Lot Numbers',
    '/transportation': 'Transportation',
    '/labour': 'Labour Management',
    '/login': 'Login',
    '/signup': 'Sign Up'
  };

  return titles[pathname] || 'Farm Manager';
};

export default Layout;
