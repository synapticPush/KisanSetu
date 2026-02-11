from pydantic_settings import BaseSettings
import secrets
from typing import Optional

class Settings(BaseSettings):
    # Database
    # Default to SQLite if DATABASE_URL is not set in .env
    DATABASE_URL: str = "sqlite:///./farmer_app.db"
    
    # JWT Security - Use environment variables with secure defaults
    JWT_SECRET: str = secrets.token_urlsafe(32)  # Generate secure secret if not provided
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 720  # Increased to 12 hours
    
    # Security
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720 # 12 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: Optional[str] = None  # Comma-separated list of origins
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600  # 1 hour
    
    # External APIs
    WEATHER_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

# Validate critical security settings on startup
if settings.JWT_SECRET == "your_jwt_secret" or len(settings.JWT_SECRET) < 32:
    raise ValueError("JWT_SECRET must be set to a secure value (at least 32 characters)")

print(f"Security configuration loaded - JWT Secret Length: {len(settings.JWT_SECRET)}")
