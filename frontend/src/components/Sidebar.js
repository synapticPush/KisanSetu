import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useOptimizedLanguage } from '../hooks/useOptimizedLanguage';
import {
  FiHome,
  FiBarChart2,
  FiMap,
  FiDollarSign,
  FiTrendingUp,
  FiPackage,
  FiTruck,
  FiUsers,
  FiLogOut,
  FiX,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onToggle, isMobile, isCollapsed, onMouseEnter, onMouseLeave }) => {
  const { t, language, toggleLanguage } = useOptimizedLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUser({ username: storedUsername });
    }
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    if (isMobile) {
      onToggle();
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { title: t('home'), icon: FiHome, path: '/dashboard', exact: true },
    { title: t('navFields'), icon: FiMap, path: '/fields' },
    { title: t('navMoney'), icon: FiDollarSign, path: '/money' },
    { title: t('navBorrowings'), icon: FiTrendingUp, path: '/borrowings' },
    { title: t('navLotNumbers'), icon: FiPackage, path: '/lot-numbers' },
    { title: t('navTransportation'), icon: FiTruck, path: '/transportation' },
    { title: t('navLabour'), icon: FiUsers, path: '/labour' }
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    ${isMobile ? 'w-72 shadow-2xl' : (isCollapsed ? 'w-20' : 'w-72')}
    bg-primary-900 text-white shadow-xl
    bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900
    flex flex-col
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fade-in"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={sidebarClasses}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Header - Brand and Welcome Message */}
        <div className={`flex flex-col h-auto px-6 py-4 border-b border-white/10 ${isCollapsed && !isMobile ? 'items-center' : ''}`}>
          {/* App Name */}
          <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} mb-4 w-full`}>
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center space-x-3 transition-opacity duration-200">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <FiTruck className="text-primary-300" />
                </div>
                <span className="font-bold text-xl tracking-wide">{t('appName') || 'KisanSetu'}</span>
              </div>
            )}

            {isCollapsed && !isMobile && (
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <FiTruck className="text-primary-300" />
              </div>
            )}

            {isMobile && (
              <button onClick={onToggle} className="p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto">
                <FiX className="text-xl" />
              </button>
            )}
          </div>

          {/* Welcome Message */}
          {user && user.username && (!isCollapsed || isMobile) && (
            <div className="w-full bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-white/70 font-medium uppercase tracking-wide">{t('welcome')}</p>
              <p className="text-sm font-bold text-primary-200 truncate">{user.username}</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && onToggle()}
                className={`
                    flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                    ${active
                    ? 'bg-white text-primary-900 shadow-md transform scale-[1.02]'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                  }
                    ${isCollapsed && !isMobile ? 'justify-center' : ''}
                 `}
                title={isCollapsed ? item.title : ''}
              >
                <Icon className={`text-xl flex-shrink-0 transition-colors ${active ? 'text-primary-700' : 'text-primary-300 group-hover:text-white'}`} />

                {(!isCollapsed || isMobile) && (
                  <span className="ml-3 font-medium whitespace-nowrap overflow-hidden text-sm">
                    {item.title}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Wrapper */}
        <div className="p-4 border-t border-white/10 bg-primary-950/30">
          {/* Collapse Toggle (Desktop Only) - REMOVED per requirements */}

          {/* User Info (if expanded) */}
          {(!isCollapsed || isMobile) && user && (
            <div className="flex items-center space-x-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary-400/50">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-primary-300 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className={`flex ${isCollapsed && !isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
            <button
              onClick={() => {
                toggleLanguage();
                if (isMobile) onToggle();
              }}
              className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary-200 text-xs font-medium transition-colors text-center"
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              {isCollapsed && !isMobile ? (language === 'en' ? 'HI' : 'EN') : (language === 'en' ? 'हिंदी' : 'English')}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-200 transition-colors"
              title={t('logout')}
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
