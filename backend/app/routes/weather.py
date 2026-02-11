from fastapi import APIRouter, HTTPException, Depends
import httpx
from app.config import settings
from app.utils.jwt import get_current_user

router = APIRouter()

WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5"
GEO_API_BASE_URL = "https://api.openweathermap.org/geo/1.0"

@router.get("/current")
async def get_current_weather(
    lat: float,
    lon: float,
    current_user: dict = Depends(get_current_user)
):
    """Proxy endpoint for current weather data."""
    if not settings.WEATHER_API_KEY:
        raise HTTPException(status_code=503, detail="Weather service not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WEATHER_API_BASE_URL}/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": settings.WEATHER_API_KEY,
                    "units": "metric"
                },
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")

@router.get("/forecast")
async def get_weather_forecast(
    lat: float,
    lon: float,
    current_user: dict = Depends(get_current_user)
):
    """Proxy endpoint for 7-day weather forecast."""
    if not settings.WEATHER_API_KEY:
        raise HTTPException(status_code=503, detail="Weather service not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{WEATHER_API_BASE_URL}/forecast",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": settings.WEATHER_API_KEY,
                    "units": "metric"
                },
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch forecast data")

@router.get("/location")
async def get_location_name(
    lat: float,
    lon: float,
    current_user: dict = Depends(get_current_user)
):
    """Proxy endpoint for reverse geocoding (get location from coordinates)."""
    if not settings.WEATHER_API_KEY:
        raise HTTPException(status_code=503, detail="Weather service not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GEO_API_BASE_URL}/reverse",
                params={
                    "lat": lat,
                    "lon": lon,
                    "limit": 1,
                    "appid": settings.WEATHER_API_KEY
                },
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail="Geocoding service unavailable")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch location data")
