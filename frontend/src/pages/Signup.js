import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../contexts/AppContext';
import logger from '../utils/logger';

const Signup = () => {
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (password) => {
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters long' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/\d/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true };
    };

    const validateUsername = (username) => {
        if (username.length < 3 || username.length > 50) {
            return { valid: false, message: 'Username must be 3-50 characters long' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
        }
        return { valid: true };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate username
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            setError(usernameValidation.message);
            setLoading(false);
            return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Enhanced password validation
        const passwordRequirements = validatePassword(password);
        if (!passwordRequirements.valid) {
            setError(passwordRequirements.message);
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/register', { username, password });

            // Store tokens securely
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('refreshToken', response.data.refresh_token);
            localStorage.setItem('username', response.data.username);

            logger.auth("Registration successful", response.data.username);
            navigate('/dashboard');
        } catch (error) {
            logger.error("Registration error", error.message);
            if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else if (error.response?.status === 400) {
                setError('Username already exists or invalid input');
            } else if (error.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-earth-50 bg-hero-pattern flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 animate-fade-in">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-earth-900 tracking-wide">
                        {t('createYourAccount')}
                    </h2>
                    <p className="mt-2 text-sm text-earth-600">
                        {t('joinFarmManager')}
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
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-earth-700">
                                {t('confirmPassword')}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="input bg-white/50 focus:bg-white"
                                    placeholder={t('confirmPassword')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        {t('creatingAccount') || 'Creating account...'}
                                    </div>
                                ) : (
                                    t('createAccount')
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <span className="text-sm text-earth-600">
                                {t('alreadyHaveAccount')}{' '}
                                <Link to="/login" className="font-bold text-primary-700 hover:text-primary-800 underline decoration-2 decoration-primary-200 hover:decoration-primary-500 transition-all">
                                    {t('signInHere')}
                                </Link>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
