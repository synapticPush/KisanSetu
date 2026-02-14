import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { fetchWeatherData } from '../services/weather';
import { useLanguage } from '../contexts/AppContext';
import { StatCard, DataCard, SectionCard, InfoBox } from '../components/Cards';
import Button from '../components/Button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDailyReportData } from '../utils/activityTracker';

const Dashboard = () => {
    const { t, language } = useLanguage();
    const [data, setData] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [locationPermission, setLocationPermission] = useState('prompting');

    useEffect(() => {
        fetchDashboardData();
        fetchWeatherForLocation();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard');
            setData(response.data);
        } catch (error) {
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchWeatherForLocation = async () => {
        try {
            setWeatherLoading(true);
            setLocationPermission('prompting');

            // Check if geolocation is supported
            if (!navigator.geolocation) {
                setLocationPermission('unsupported');
                throw new Error('Geolocation is not supported by this browser');
            }

            // Fetch weather based on current location (no location parameter)
            const weather = await fetchWeatherData();
            setWeatherData(weather);
            setLocationPermission('granted');
        } catch (error) {
            console.error('Error fetching weather data:', error);
            // Handle specific location errors
            if (error.message.includes('Location access failed')) {
                if (error.message.includes('denied')) {
                    setLocationPermission('denied');
                } else if (error.message.includes('not supported')) {
                    setLocationPermission('unsupported');
                } else {
                    setLocationPermission('error');
                }
                // Don't set weather data on location errors
                return;
            }

            // For other errors, set permission to error
            setLocationPermission('error');
        } finally {
            setWeatherLoading(false);
        }
    };

    const handleDownloadReport = () => {
        try {
            console.log('Starting PDF generation...');
            
            // Check if localStorage is available
            if (typeof localStorage === 'undefined') {
                throw new Error('localStorage is not available');
            }
            
            const reportData = getDailyReportData();
            console.log('Report data retrieved:', reportData);
            
            if (!reportData) {
                throw new Error('Unable to retrieve report data');
            }
            
            const doc = new jsPDF();
            const dateStr = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN');
            const timeStr = new Date().toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-IN');

            // Set default font
            doc.setFont('helvetica');
            
            // Add Title
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.text(`${t('appName') || 'KisanSetu'} - Daily Report`, 14, 22);
            
            // Add metadata
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            doc.text(`Date: ${dateStr}`, 14, 30);
            doc.text(`Generated At: ${timeStr}`, 14, 36);

            // Add note for Hindi users (positioned after header)
            if (language === 'hi') {
                doc.setFontSize(9);
                doc.setTextColor(120, 120, 120);
                doc.text("(Note: PDF content is in English for better compatibility)", 14, 42);
            }

            const startY = language === 'hi' ? 50 : 45;

            if (reportData.length === 0) {
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text("No new activities recorded for today.", 14, startY);
            } else {
                const tableColumn = ["Time", "Feature", "Action", "Details"];
                const tableRows = [];

                reportData.forEach(log => {
                    const activityData = [
                        log.time || 'N/A',
                        log.feature || 'N/A',
                        log.action || 'N/A',
                        log.details || 'N/A'
                    ];
                    tableRows.push(activityData);
                });

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: startY,
                    theme: 'grid',
                    headStyles: { 
                        fillColor: [66, 133, 244],
                        textColor: [255, 255, 255],
                        fontSize: 11,
                        fontStyle: 'bold'
                    },
                    styles: { 
                        fontSize: 10, 
                        cellPadding: 3,
                        font: 'helvetica',
                        textColor: [0, 0, 0]
                    },
                    columnStyles: {
                        0: { cellWidth: 25 },  // Time
                        1: { cellWidth: 45 },  // Feature
                        2: { cellWidth: 25 },  // Action
                        3: { cellWidth: 'auto' } // Details
                    }
                });
            }

            // Force download
            const filename = `daily_report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            console.log(`Report generated successfully: ${filename}`);
            alert(`Report downloaded: ${reportData.length} activities recorded today`);
        } catch (error) {
            console.error('Error generating PDF report:', error);
            console.error('Error details:', error.message, error.stack);
            alert(`Failed to generate PDF report: ${error.message}. Please check console for details.`);
        }
    };

    if (loading || weatherLoading) {
        return (
            <div className="min-h-screen bg-earth-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-earth-600">{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-earth-50 flex items-center justify-center">
                <div className="card max-w-md w-full mx-4">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-earth-900 mb-2">{t('error')}</h3>
                        <p className="text-earth-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const potatoTypes = data.potato_types || {};
    const weatherForecast = weatherData?.forecast || [];

    const getWeatherIcon = (condition) => {
        switch (condition) {
            case 'Sunny':
                return (
                    <svg className="w-8 h-8 mx-auto text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 0118 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                    </svg>
                );
            case 'Partly Cloudy':
                return (
                    <svg className="w-8 h-8 mx-auto text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                    </svg>
                );
            case 'Cloudy':
                return (
                    <svg className="w-8 h-8 mx-auto text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                    </svg>
                );
            case 'Light Rain':
                return (
                    <svg className="w-8 h-8 mx-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8zm-1-8a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2zm-4 4a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'Heavy Rain':
                return (
                    <svg className="w-8 h-8 mx-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8zm-1-8a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2zm-4 4a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'Thunderstorm':
                return (
                    <svg className="w-8 h-8 mx-auto text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8zm-1-8a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2zm-4 4a1 1 0 100 2 1 1 0 000-2zm4 0a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'Fog':
                return (
                    <svg className="w-8 h-8 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'Mist':
                return (
                    <svg className="w-8 h-8 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-8 h-8 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const getWeatherAnalysis = (forecast) => {
        if (!forecast || forecast.length === 0) return { type: 'info', message: '' };

        // Check for rain or extreme weather
        const alertConditions = ['Rain', 'Thunderstorm', 'Snow', 'Storm'];
        const alertDays = forecast.filter(d =>
            alertConditions.some(cond => d.condition.includes(cond))
        );

        if (alertDays.length > 0) {
            // Get unique days
            const days = alertDays.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long' });
            }).filter((value, index, self) => self.indexOf(value) === index); // Unique values

            const dayString = days.join(', ');
            return {
                type: 'alert',
                message: `${t('weatherAlertPrefix')} ${dayString}. ${t('takePrecautions')}`
            };
        }

        return {
            type: 'success',
            message: t('weatherClearForecast')
        };
    };

    return (
        <main className="bg-gradient-to-b from-earth-50 to-earth-100 min-h-screen pb-8">
            <div className="container-md px-4 md:px-6">

                {/* Daily Report Button */}
                <div className="flex justify-end pt-6">
                     <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 bg-earth-600 hover:bg-earth-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                        title={t('downloadDailyReport')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('dailyReport')}
                    </button>
                </div>

                {/* Main Stats - Mobile Friendly Grid */}
                <div className="stats-grid mb-6 pt-6 text-sm md:text-base">
                    <StatCard
                        title={t('totalFields')}
                        value={data.total_fields || 0}
                        icon="🌾"
                        variant="primary"
                    />
                    <StatCard
                        title={t('totalYieldLabel')}
                        value={`${data.total_yield || 0} ${t('packets')}`}
                        icon="📦"
                        variant="secondary"
                    />
                    <StatCard
                        title={t('totalTransported')}
                        value={`${data.total_transported || 0} ${t('packets')}`}
                        icon="🚚"
                        variant="info"
                    />
                    <StatCard
                        title={t('laborCost')}
                        value={`₹${data.total_labour_cost || 0}`}
                        icon="👥"
                        variant="warning"
                    />
                    <StatCard
                        title={t('labourEarnings')}
                        value={`₹${data.total_earnings || 0}`}
                        icon="💰"
                        variant="success"
                    />
                </div>


                {/* Potato Types Breakdown - Mobile Optimized */}
                <SectionCard
                    title={t('yieldByPotatoType')}
                    subtitle={t('yieldDistributionSubtitle') || 'Distribution of yield across potato categories'}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <DataCard
                            title={t('large')}
                            value={potatoTypes.large || 0}
                            subtitle={t('packets')}
                            status="active"
                        />
                        <DataCard
                            title={t('medium')}
                            value={potatoTypes.medium || 0}
                            subtitle={t('packets')}
                            status="active"
                        />
                        <DataCard
                            title={t('small')}
                            value={potatoTypes.small || 0}
                            subtitle={t('packets')}
                            status="active"
                        />
                        <DataCard
                            title={t('overlarge')}
                            value={potatoTypes.overlarge || 0}
                            subtitle={t('packets')}
                            status="active"
                        />
                    </div>
                    <div className="mt-6 pt-6 border-t-2 border-earth-200 bg-gradient-to-r from-primary-50 to-transparent rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-earth-700 uppercase tracking-wide">{t('totalYieldLabel')}</span>
                            <span className="text-2xl font-extrabold text-primary-700">{data.total_yield || 0} {t('packets')}</span>
                        </div>
                    </div>
                </SectionCard>

                {/* Weather Section - Mobile Optimized */}
                <div className="mt-6">
                    <SectionCard
                        title={t('weatherForecast')}
                        action={
                            weatherData && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchWeatherForLocation}
                                    disabled={weatherLoading}
                                    icon={weatherLoading ? '⟳' : '🔄'}
                                >
                                    {weatherLoading ? 'Loading...' : 'Refresh'}
                                </Button>
                            )
                        }
                    >                    
                        {/* Status indicator */}
                        <div className="mb-4 flex items-center gap-2">
                            {locationPermission === 'prompting' && (
                                <InfoBox
                                    variant="info"
                                    icon="📍"
                                    title="Location Access"
                                    description="Getting your location for accurate weather data..."
                                />
                            )}
                            {locationPermission === 'denied' && (
                                <InfoBox
                                    variant="warning"
                                    icon="⚠️"
                                    title="Location Access Denied"
                                    description="Enable location to see weather data"
                                />
                            )}
                            {locationPermission === 'error' && (
                                <InfoBox
                                    variant="error"
                                    icon="❌"
                                    title="Location Error"
                                    description="Unable to get location"
                                />
                            )}
                        </div>

                        {/* Current Weather - Prominent Display */}
                        {weatherData?.current && (
                            <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 border-2 border-blue-200 rounded-2xl shadow-lg mb-6 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Temperature and Condition */}
                                    <div className="md:col-span-2">
                                        <p className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                                            {t('currentWeather')}
                                        </p>
                                        <div className="flex items-end gap-2 mb-3">
                                            <p className="text-5xl font-black text-earth-900">
                                                {weatherData.current.temperature}°
                                            </p>
                                            <p className="text-2xl font-bold text-earth-700 mb-2">C</p>
                                        </div>
                                        <p className="text-xl font-bold text-earth-800 mb-3">
                                            {weatherData.current.condition}
                                        </p>
                                        <p className="text-earth-700 text-sm font-medium flex items-center gap-2">
                                            <span className="text-base">📍</span>
                                            {weatherData.current.location}
                                        </p>
                                    </div>
                                    
                                    {/* Weather Icon */}
                                    <div className="flex items-center justify-center">
                                        <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl shadow-md">
                                            <div className="text-6xl">
                                                {getWeatherIcon(weatherData.current.condition)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Additional Details */}
                                <div className="mt-6 pt-6 border-t-2 border-blue-200 grid grid-cols-2 gap-4">
    {/* Humidity */}
    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
        <p className="text-xs text-blue-700 font-bold uppercase mb-2">
            Humidity
        </p>
        <div className="flex items-center justify-center gap-2 text-earth-900">
            <span className="text-xl">💧</span>
            <span className="text-xl font-bold whitespace-nowrap">
                {weatherData.current.humidity}%
            </span>
        </div>
    </div>

    {/* Wind Speed */}
    <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
        <p className="text-xs text-blue-700 font-bold uppercase mb-2">
            Wind Speed
        </p>
        <div className="flex items-center justify-center gap-2 text-earth-900">
            <span className="text-xl">💨</span>
            <span className="text-xl font-bold whitespace-nowrap">
                {weatherData.current.wind_speed} km/h
            </span>
        </div>
    </div>
</div>
</div>
)}


                        {/* Weather Forecast - Scrollable Cards */}
                        {weatherData?.forecast && (
                            <div className="mb-6">
                                <p className="text-base font-bold text-earth-900 mb-4">{t('sevenDayForecast') || '7-Day Forecast'}</p>
                                <div className="flex overflow-x-auto gap-3 pb-3">
                                    {weatherData.forecast.map((weather, index) => (
                                        <div
                                            key={index}
                                            className="flex-shrink-0 bg-gradient-to-br from-earth-50 to-white border-2 border-earth-200 rounded-xl p-4 min-w-[140px] text-center shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
                                        >
                                            <p className="text-xs font-bold text-earth-900 mb-1">{weather.day}</p>
                                            <p className="text-xs text-earth-600 font-medium mb-3">{weather.date}</p>
                                            <div className="mb-3">
                                                <div className="w-12 h-12 mx-auto bg-white/50 rounded-full flex items-center justify-center shadow-sm">
                                                    {getWeatherIcon(weather.condition)}
                                                </div>
                                            </div>
                                            <p className="text-xs text-earth-700 font-medium mb-3 break-words min-h-[32px] flex items-center justify-center">{weather.condition}</p>
                                            <p className="text-xl font-extrabold text-earth-900 mb-1">
                                                {weather.temp_max}°C
                                            </p>
                                            <p className="text-xs text-earth-600 font-medium flex items-center justify-center gap-1">
                                                <span>💧</span>
                                                <span>{weather.humidity}%</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alert Box */}
                        {weatherData && (
                            <InfoBox
                                variant={getWeatherAnalysis(weatherData.forecast).type === 'alert' ? 'warning' : 'success'}
                                icon={getWeatherAnalysis(weatherData.forecast).type === 'alert' ? '⚠️' : '✓'}
                                title={t('weatherAlert') || 'Weather Alert'}
                                description={getWeatherAnalysis(weatherData.forecast).message}
                            />
                        )}

                        {/* Error/Permission States */}
                        {!weatherLoading && !weatherData && locationPermission === 'denied' && (
                            <InfoBox
                                variant="warning"
                                icon="📍"
                                title="Enable Location"
                                description="Please allow location access to see weather data"
                            />
                        )}

                        {!weatherLoading && !weatherData && locationPermission === 'error' && (
                            <InfoBox
                                variant="error"
                                icon="❌"
                                title="Weather Data Error"
                                description="Unable to fetch weather data"
                            />
                        )}

                        {!weatherLoading && !weatherData && locationPermission === 'unsupported' && (
                            <InfoBox
                                variant="info"
                                icon="ℹ"
                                title="Geolocation Not Supported"
                                description="Your browser doesn't support location access"
                            />
                        )}
                    </SectionCard>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
