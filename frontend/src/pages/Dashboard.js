import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { fetchWeatherData } from '../services/weather';
import { useLanguage } from '../contexts/AppContext';
import { StatCard, DataCard, SectionCard, InfoBox } from '../components/Cards';
import Button from '../components/Button';

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
        <main className="bg-earth-50 min-h-screen pb-8">
            <div className="container-md">
                {/* Page Header
                <div className="mb-6 mt-6">
                    <p className="text-earth-600 text-sm sm:text-base md:text-sm">{t('overview')}</p>
                </div> */}

                {/* Main Stats - Mobile Friendly Grid */}
                <div className="stats-grid mb-6 text-sm md:text-base">
    <DataCard
        title={t('totalFields')}
        value={data.total_fields || 0}
        icon="🌾"
        variant="primary"
        status="active"
    />
    <DataCard
        title={t('totalYield')}
        value={`${data.total_yield || 0} ${t('packets')}`}
        icon="📦"
        variant="secondary"
        status="active"
    />
    <DataCard
        title={t('laborCost')}
        value={`₹${data.total_labour_cost || 0}`}
        icon="👥"
        variant="warning"
        status="active"
    />
    <DataCard
        title={t('labourEarnings')}
        value={`₹${data.total_earnings || 0}`}
        icon="💰"
        variant="success"
        status="active"
    />
</div>


                {/* Potato Types Breakdown - Mobile Optimized */}
                <SectionCard
                    title={t('yieldByPotatoType')}
                    subtitle={t('yieldDistributionSubtitle') || 'Distribution of yield across potato categories'}
                >
                    <div className="card-grid">
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
                    <div className="mt-6 pt-6 border-t border-earth-200">
                        <div className="flex items-center justify-between">
                            <span className="text-base sm:text-lg md:text-base font-semibold text-earth-700">{t('totalYieldLabel')}</span>
                            <span className="text-xl sm:text-2xl md:text-xl font-bold text-primary-600">{data.total_yield || 0} {t('packets')}</span>
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
                            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 mb-4 p-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <p className="text-earth-600 text-xs md:text-xs font-semibold uppercase tracking-wide mb-1">
                                            {t('currentWeather')}
                                        </p>
                                        <p className="text-3xl md:text-2xl font-bold text-earth-900 mb-1">
                                            {weatherData.current.temperature}°C
                                        </p>
                                        <p className="text-base md:text-sm font-semibold text-earth-700 mb-2">
                                            {weatherData.current.condition}
                                        </p>
                                        <p className="text-earth-600 text-xs md:text-xs">
                                            📍 {weatherData.current.location}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-5xl mb-2">
                                            {getWeatherIcon(weatherData.current.condition)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-earth-600 mb-1">Humidity</p>
                                        <p className="text-lg font-bold text-earth-900">💧 {weatherData.current.humidity}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-earth-600 mb-1">Wind Speed</p>
                                        <p className="text-lg font-bold text-earth-900">💨 {weatherData.current.wind_speed}km/h</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Weather Forecast - Scrollable Cards */}
                        {weatherData?.forecast && (
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-earth-700 mb-3">{t('sevenDayForecast') || '7-Day Forecast'}</p>
                                <div className="flex overflow-x-auto gap-3 pb-2">
                                    {weatherData.forecast.map((weather, index) => (
                                        <div
                                            key={index}
                                            className="flex-shrink-0 card p-3 min-w-[120px] text-center"
                                        >
                                            <p className="text-xs font-bold text-earth-700 mb-1">{weather.day}</p>
                                            <p className="text-xs text-earth-500 mb-2">{weather.date}</p>
                                            <div className="mb-2">
                                                <div className="w-10 h-10 mx-auto">
                                                    {getWeatherIcon(weather.condition)}
                                                </div>
                                            </div>
                                            <p className="text-xs text-earth-600 mb-2 break-words">{weather.condition}</p>
                                            <p className="text-sm font-bold text-earth-900">
                                                {weather.temp_max}°C
                                            </p>
                                            <p className="text-xs text-earth-500">
                                                {weather.humidity}% 💧
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
