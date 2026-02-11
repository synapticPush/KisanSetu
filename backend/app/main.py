from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, field, money, dashboard, yield_routes, borrowing, lot_numbers, labour, transportation, weather
from app.db import Base, engine
from app.models import user, field as field_model, lot_number, labour as labour_model
from app.config import settings
from sqlalchemy import text

# Initialize the database
Base.metadata.create_all(bind=engine)

# Run migrations only if using SQLite
if "sqlite" in settings.DATABASE_URL:
    migrate_lot_numbers_table()
    migrate_labour_tables()
else:
    print("ℹ️ Skipping manual migrations for non-SQLite database. Schema will be handled by SQLAlchemy.")

app = FastAPI(
    title="FarmManager API",
    description="Secure Farm Management System API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc" 
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is running"}

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
    "img-src 'self' data:; "
    "font-src 'self' https://cdn.jsdelivr.net"
)

    return response

# CORS Middleware - More secure configuration
allowed_origins = []
if settings.ALLOWED_ORIGINS:
    allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
else:
    # Development fallback
    allowed_origins = [
        "https://kisansetu.pages.dev",
        "https://kisansetu.syanpticpush.indevs.in"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],  # More restrictive
)

# Include routes
app.include_router(auth.router, prefix="/auth")
app.include_router(field.router, prefix="/fields")
app.include_router(yield_routes.router, prefix="/fields")
app.include_router(money.router, prefix="/money-records")
app.include_router(borrowing.router, prefix="/borrowings")
app.include_router(lot_numbers.router, prefix="/lot-numbers")
app.include_router(labour.router, prefix="/labour")
app.include_router(dashboard.router, prefix="/dashboard")
app.include_router(transportation.router, prefix="/transportations")
app.include_router(weather.router, prefix="/weather")

print(f"FarmManager API started with security level: {'PRODUCTION' if settings.ALLOWED_ORIGINS else 'DEVELOPMENT'}")
print(f"Allowed origins: {allowed_origins}")
