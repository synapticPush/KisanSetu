import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/AppContext';
import logger from '../utils/logger';

const Login = ({ setIsAuthenticated }) => {
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate inputs
            if (!username.trim() || !password.trim()) {
                setError(t('error')); // Using translation key if specific message not in dict
                setLoading(false);
                return;
            }

            const response = await api.post('/auth/login', { username: username.trim(), password });

            const token = response.data.access_token;
            const refreshToken = response.data.refresh_token;
            const username_response = response.data.username;

            if (!token) {
                throw new Error('No token received from server');
            }

            // Store tokens securely
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('username', username_response);

            logger.auth("Login successful", username_response);

            if (typeof setIsAuthenticated === 'function') {
                setIsAuthenticated(true);
            }

            // Trigger storage event for cross-tab synchronization
            window.dispatchEvent(new Event('storage'));

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            logger.error("Login failed", error.message);

            if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else if (error.response?.status === 401) {
                setError('Invalid username or password');
            } else if (error.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                setError('Network error. Please check your connection.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-earth-50 bg-hero-pattern flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 animate-fade-in">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-earth-900 tracking-wide">
                        {t('signInToAccount')}
                    </h2>
                    <p className="mt-2 text-sm text-earth-600">
                        {t('welcomeBack')}
                    </p>
                </div>

                <div className="glass-card p-8 shadow-xl backdrop-blur-md bg-white/90">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-100 animate-slide-up">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-earth-700">
                                {t('username')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="input bg-white/50 focus:bg-white"
                                    placeholder={t('username')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-earth-700">
                                {t('password')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="input bg-white/50 focus:bg-white"
                                    placeholder={t('password')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary text-center disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('signIn')}
                                    </div>
                                ) : (
                                    t('signIn')
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-sm text-earth-600">
                                {t('dontHaveAccount')}{' '}
                                <Link to="/signup" className="font-bold text-primary-700 hover:text-primary-800 underline decoration-2 decoration-primary-200 hover:decoration-primary-500 transition-all">
                                    {t('createOneHere')}
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
