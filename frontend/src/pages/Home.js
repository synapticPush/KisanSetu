import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/AppContext';

const Home = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-earth-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-earth-900 mb-6">
                            {t('welcomeTo')} <span className="text-primary-600">FarmSetu</span>
                        </h1>
                        <p className="text-xl text-earth-600 mb-8 max-w-3xl mx-auto">
                            {t('homeDescription')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/dashboard"
                                className="btn btn-primary px-8 py-3 text-lg"
                            >
                                {t('viewDashboard')}
                            </Link>
                            <Link
                                to="/fields"
                                className="btn btn-secondary px-8 py-3 text-lg"
                            >
                                {t('manageFields')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-earth-900 mb-4">
                            {t('everythingYouNeed')}
                        </h2>
                        <p className="text-lg text-earth-600 max-w-2xl mx-auto">
                            {t('powerfulToolsDescription')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Field Management Card */}
                        <div className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-earth-900 mb-2">{t('fieldManagement')}</h3>
                            <p className="text-earth-600 mb-4">
                                {t('fieldManagementDescription')}
                            </p>
                            <Link
                                to="/fields"
                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                                {t('manageFields')}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Financial Tracking Card */}
                        <div className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-earth-900 mb-2">{t('financialTracking')}</h3>
                            <p className="text-earth-600 mb-4">
                                {t('financialTrackingDescription')}
                            </p>
                            <Link
                                to="/money"
                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                                {t('trackFinances')}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Analytics Dashboard Card */}
                        <div className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-earth-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-earth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-earth-900 mb-2">{t('analyticsDashboard')}</h3>
                            <p className="text-earth-600 mb-4">
                                {t('analyticsDashboardDescription')}
                            </p>
                            <Link
                                to="/dashboard"
                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                                {t('viewDashboard')}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Borrowings Management Card */}
                        <div className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-earth-900 mb-2">{t('borrowingsManagement')}</h3>
                            <p className="text-earth-600 mb-4">
                                {t('borrowingsManagementDescription')}
                            </p>
                            <Link
                                to="/borrowings"
                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                                {t('manageBorrowings')}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Labor Management Card */}
                        <div className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-earth-900 mb-2">{t('laborManagement')}</h3>
                            <p className="text-earth-600 mb-4">
                                {t('laborManagementDescription')}
                            </p>
                            <Link
                                to="/money"
                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                                {t('manageLabor')}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Season Planning Card */}
                        <div className="card hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-earth-100 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-earth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-earth-900 mb-2">{t('seasonPlanning')}</h3>
                            <p className="text-earth-600 mb-4">
                                {t('seasonPlanningDescription')}
                            </p>
                            <Link
                                to="/fields"
                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                            >
                                {t('planSeasons')}
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary-600 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        {t('readyToTransform')}
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        {t('getStartedDescription')}
                    </p>
                    <Link
                        to="/dashboard"
                        className="bg-white text-primary-600 hover:bg-earth-50 px-8 py-3 rounded-md text-lg font-semibold transition-colors"
                    >
                        {t('getStartedNow')}
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
