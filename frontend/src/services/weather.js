// Weather API service - Now uses secure backend proxy
import api from './api';
import logger from '../utils/logger';

export const fetchWeatherData = async (location = null) => {
    let coords = null;
    let locationName = location;

    try {
        // 1. Get coordinates
        if (!location) {
            const position = await getCurrentLocation();
            coords = position;

            // Try to get exact location name (village/town)
            try {
                const response = await api.get('/weather/location', {
                    params: {
                        lat: position.latitude,
                        lon: position.longitude
                    }
                });
                const data = response.data;
                locationName = data[0]?.name || `Lat ${position.latitude.toFixed(2)}, Lon ${position.longitude.toFixed(2)}`;
                logger.weather("Location name resolved", locationName);
            } catch (e) {
                // Fallback to coordinates if reverse geocoding fails
                locationName = `Lat ${position.latitude.toFixed(2)}, Lon ${position.longitude.toFixed(2)}`;
                logger.warn("Location name lookup failed", e.message);
            }
        }

        // 2. Fetch current weather using backend proxy
        const currentWeatherResponse = await api.get('/weather/current', {
            params: {
                lat: coords.latitude,
                lon: coords.longitude
            }
        });

        const currentWeather = currentWeatherResponse.data;

        // 3. Fetch forecast using backend proxy
        const forecastResponse = await api.get('/weather/forecast', {
            params: {
                lat: coords.latitude,
                lon: coords.longitude
            }
        });

        const forecastData = forecastResponse.data;

        const weatherData = processWeatherData(
            currentWeather,
            forecastData,
            locationName
        );

        // 4. Cache last successful weather (IMPORTANT)
        localStorage.setItem("weatherCache", JSON.stringify(weatherData));
        logger.weather("Weather data fetched and cached", "success");

        return weatherData;

    } catch (error) {
        logger.error("Weather API failed", error.message);

        // 5. Use cached data instead of random data
        const cached = localStorage.getItem("weatherCache");
        if (cached) {
            logger.weather("Using cached weather data");
            return JSON.parse(cached);
        }

        // 6. Final fallback (only if nothing exists)
        logger.weather("Using fallback weather data");
        return getFallbackWeatherData(locationName || "Current Location");
    }
};

// -------------------- PROCESS WEATHER --------------------

const processWeatherData = (currentWeather, forecastData, locationName) => {
    const mapCondition = (main, desc) => {
        main = main.toLowerCase();
        desc = desc.toLowerCase();

        if (main === 'clear') return 'Sunny';
        if (main === 'clouds') return 'Cloudy';
        if (main === 'rain') return 'Rain';
        if (main === 'drizzle') return 'Light Rain';
        if (main === 'thunderstorm') return 'Thunderstorm';
        if (main === 'mist' || main === 'fog') return 'Fog';

        return 'Partly Cloudy';
    };

    const dailyForecasts = {};
    const baseDate = new Date();

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = { temps: [], humidity: [], wind: [], cond: [] };
        }

        dailyForecasts[date].temps.push(item.main.temp);
        dailyForecasts[date].humidity.push(item.main.humidity);
        dailyForecasts[date].wind.push(item.wind.speed * 3.6);
        dailyForecasts[date].cond.push(mapCondition(item.weather[0].main, item.weather[0].description));
    });

    const forecast = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split('T')[0];

        const day = dailyForecasts[key];
        if (!day) continue;

        forecast.push({
            date: key,
            day: d.toLocaleDateString('en-US', { weekday: 'long' }),
            temp_max: Math.round(Math.max(...day.temps)),
            temp_min: Math.round(Math.min(...day.temps)),
            humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
            wind_speed: Math.round(day.wind.reduce((a, b) => a + b, 0) / day.wind.length),
            condition: day.cond[0],
            description: day.cond[0]
        });
    }

    return {
        current: {
            location: locationName,
            temperature: Math.round(currentWeather.main.temp),
            condition: mapCondition(
                currentWeather.weather[0].main,
                currentWeather.weather[0].description
            ),
            humidity: currentWeather.main.humidity,
            wind_speed: Math.round(currentWeather.wind.speed * 3.6),
            description: currentWeather.weather[0].description
        },
        forecast
    };
};

// -------------------- LOCATION HELPERS --------------------

const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            pos => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            }),
            err => reject(err),
            { enableHighAccuracy: true, timeout: 15000 }
        );
    });
};

// -------------------- FALLBACK (STABLE, NOT RANDOM) --------------------

const getFallbackWeatherData = (location) => {
    const today = new Date().toISOString().split('T')[0];

    return {
        current: {
            location,
            temperature: 25,
            condition: 'Partly Cloudy',
            humidity: 60,
            wind_speed: 10,
            description: 'Stable fallback weather'
        },
        forecast: [{
            date: today,
            day: 'Today',
            temp_max: 27,
            temp_min: 20,
            condition: 'Partly Cloudy',
            humidity: 60,
            wind_speed: 10,
            description: 'Stable fallback weather'
        }]
    };
};

export default { fetchWeatherData };
