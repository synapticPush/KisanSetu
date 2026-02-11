import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/AppContext';
import logger from '../utils/logger';
import { FiMenu, FiX, FiTruck } from 'react-icons/fi';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
    const { language, toggleLanguage, t } = useLanguage();
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        setToken(storedToken);
        if (storedUsername) {
            setUser({ username: storedUsername });
        }
    }, [isAuthenticated, language]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        setToken(null);
        setIsAuthenticated(false);
        logger.auth("User logged out");
        navigate('/login');
    };

    return (
        <nav className="glass-panel sticky top-0 z-40 mx-4 mt-4 rounded-xl px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center min-h-18 py-4 flex-wrap gap-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-primary-700 transition-colors">
                                <FiTruck className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-bold text-earth-900 tracking-tight group-hover:text-primary-700 transition-colors">{t('farmManager')}</span>
                        </Link>
                    </div>

                    {/* Welcome Message - Desktop and Tablet */}
                    {token && user && user.username && (
                        <div className="hidden sm:flex items-center space-x-2 text-earth-700">
                            <span className="text-base md:text-lg font-semibold">{t('welcome')},</span>
                            <span className="text-base md:text-lg font-bold text-primary-600">{user.username}</span>
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="nav-link text-earth-600 hover:text-primary-600 hover:bg-earth-50">
                            {t('home')}
                        </Link>
                        {token ? (
                            <>
                                <Link to="/fields" className="nav-link text-earth-600 hover:text-primary-600 hover:bg-earth-50">{t('fields')}</Link>
                                <Link to="/money" className="nav-link text-earth-600 hover:text-primary-600 hover:bg-earth-50">{t('money')}</Link>
                                <Link to="/borrowings" className="nav-link text-earth-600 hover:text-primary-600 hover:bg-earth-50">{t('borrowings')}</Link>
                                <Link to="/labour-management" className="nav-link text-earth-600 hover:text-primary-600 hover:bg-earth-50">{t('labourManagement')}</Link>
                                <Link to="/dashboard" className="nav-link text-earth-600 hover:text-primary-600 hover:bg-earth-50">{t('dashboard')}</Link>

                                <button
                                    onClick={toggleLanguage}
                                    className="p-2 rounded-lg text-earth-600 hover:text-primary-600 hover:bg-earth-50 transition-colors font-semibold"
                                >
                                    {language === 'en' ? 'EN' : 'हि'}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-danger ml-2"
                                >
                                    {t('logout')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link text-earth-600 hover:text-primary-600 hover:bg-earth-50">{t('login')}</Link>
                                <Link to="/signup" className="btn btn-primary ml-2">{t('signup')}</Link>
                                <button
                                    onClick={toggleLanguage}
                                    className="p-2 rounded-lg text-earth-600 hover:text-primary-600 hover:bg-earth-50 transition-colors font-semibold ml-2"
                                >
                                    {language === 'en' ? 'EN' : 'हि'}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={toggleLanguage}
                            className="p-2 rounded-lg text-earth-600 hover:bg-earth-50 font-semibold"
                        >
                            {language === 'en' ? 'EN' : 'हि'}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-earth-600 hover:bg-earth-50 hover:text-primary-600"
                        >
                            {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-earth-100 py-4 space-y-2 animate-fade-in">
                        {/* Welcome message on mobile */}
                        {token && user && user.username && (
                            <div className="px-4 py-3 bg-primary-50 rounded-lg mb-2">
                                <p className="text-sm text-earth-600">{t('welcome')},</p>
                                <p className="text-lg font-bold text-primary-600">{user.username}</p>
                            </div>
                        )}
                        <Link to="/" className="block px-4 py-2 text-earth-600 hover:bg-earth-50 rounded-lg">{t('home')}</Link>
                        {token ? (
                            <>
                                <Link to="/fields" className="block px-4 py-2 text-earth-600 hover:bg-earth-50 rounded-lg">{t('fields')}</Link>
                                <Link to="/money" className="block px-4 py-2 text-earth-600 hover:bg-earth-50 rounded-lg">{t('money')}</Link>
                                <Link to="/dashboard" className="block px-4 py-2 text-earth-600 hover:bg-earth-50 rounded-lg">{t('dashboard')}</Link>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">{t('logout')}</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-4 py-2 text-earth-600 hover:bg-earth-50 rounded-lg">{t('login')}</Link>
                                <Link to="/signup" className="block px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg">{t('signup')}</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
