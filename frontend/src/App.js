import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/AppContext';
import logger from './utils/logger';

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Fields from './pages/Fields';
import LotNumbers from './pages/LotNumbers';
import Money from './pages/Money';
import Borrowings from './pages/Borrowings';
import LabourManagement from './pages/LabourManagement';
import Transportation from './pages/Transportation';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/dashboard" /> : children;
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        // Check authentication status on mount and when localStorage changes
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            setIsAuthenticated(!!token);
            setAuthChecked(true);
            logger.auth("Auth check", !!token ? "authenticated" : "not authenticated");
        };

        // Initial check
        checkAuth();

        // Listen for storage changes (cross-tab synchronization)
        const handleStorageChange = (e) => {
            if (!e || e.key == null || e.key === 'token' || e.key === 'username') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-earth-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-earth-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <LanguageProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login setIsAuthenticated={setIsAuthenticated} />
                        </PublicRoute>
                    } />
                    <Route path="/signup" element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    } />

                    {/* Protected routes with Layout */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="fields" element={<Fields />} />
                        <Route path="labour-management" element={<LabourManagement />} />
                        <Route path="labour" element={<LabourManagement />} />
                        <Route path="lot-numbers" element={<LotNumbers />} />
                        <Route path="money" element={<Money />} />
                        <Route path="borrowings" element={<Borrowings />} />
                        <Route path="transportation" element={<Transportation />} />
                        <Route path="" element={<Navigate to="/dashboard" />} />
                    </Route>
                </Routes>
            </Router>
        </LanguageProvider>
    );
};

export default App;
