from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.models.field import Field
from app.models.yield_model import Yield
from app.models.labour import Task, Payment, LabourAttendance, Labourer
from app.models.money import MoneyRecord
from app.models.transportation import Transportation
from app.db import get_db
from app.utils.jwt import get_current_user
import requests
from datetime import datetime, timedelta

router = APIRouter()

def get_weather_forecast():
    """Get weather forecast for Delhi, India (7 days)"""
    try:
        # Using OpenWeatherMap API (you'll need to add your API key)
        # For demo purposes, returning mock data
        # In production, you'd use: API_KEY = "your_openweather_api_key"
        # url = f"http://api.openweathermap.org/data/2.5/forecast?q=Delhi,IN&appid={API_KEY}&units=metric"
        
        # Mock weather data for demonstration
        base_date = datetime.now()
        weather_data = []
        
        for i in range(7):
            date = base_date + timedelta(days=i)
            weather_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "day": date.strftime("%A"),
                "temp_max": 25 + (i % 5),
                "temp_min": 15 + (i % 3),
                "condition": ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][i % 4],
                "humidity": 60 + (i % 20),
                "wind_speed": 10 + (i % 8)
            })
        
        return weather_data
    except Exception as e:
        print(f"Weather API error: {e}")
        return []

@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Total fields
    total_fields = db.query(func.count(Field.id)).filter(Field.user_id == current_user["id"]).scalar()

    # Total yield by potato type
    yield_data = db.query(
        func.sum(Yield.large),
        func.sum(Yield.medium), 
        func.sum(Yield.small),
        func.sum(Yield.overlarge)
    ).join(Field).filter(Field.user_id == current_user["id"]).first()
    
    if yield_data:
        total_large = yield_data[0] or 0
        total_medium = yield_data[1] or 0
        total_small = yield_data[2] or 0
        total_overlarge = yield_data[3] or 0
    else:
        total_large = total_medium = total_small = total_overlarge = 0
    total_yield = total_large + total_medium + total_small + total_overlarge

    # Total labour cost (sum of money records expenses and labour payments)
    total_labour_payments = db.query(func.sum(Payment.amount)).filter(Payment.user_id == current_user["id"]).scalar() or 0
    total_expenses = db.query(func.sum(MoneyRecord.amount)).filter(MoneyRecord.user_id == current_user["id"]).scalar() or 0
    
    total_labour_cost = total_expenses + total_labour_payments

    # Total expenses (money records)
    # Already fetched above as total_expenses

    # Profit/loss estimate (assuming yield packets * some price per packet)
    # Calculate Labour Earnings (Total wages earned by labourers based on attendance)
    # Join Attendance with Labourer to get daily wage
    # Optimized: Use SQL aggregation instead of fetching all records
    total_earnings = db.query(
    func.sum(
        case(
            (LabourAttendance.status == 'full', Labourer.daily_wage),
            (LabourAttendance.status == 'half', Labourer.daily_wage * 0.5),
            else_=0
        )
    )
).select_from(LabourAttendance).join(
    Labourer,
    LabourAttendance.labourer_id == Labourer.id
).filter(
    LabourAttendance.user_id == current_user["id"]
).scalar() or 0

            
    # Keep profit loss estimate logic but separate
    price_per_packet = 50
    profit_loss = (total_yield * price_per_packet) - (total_labour_cost or 0) - (total_expenses or 0)

    # Total transported packets
    transport_data = db.query(
        func.sum(Transportation.small_packets),
        func.sum(Transportation.medium_packets),
        func.sum(Transportation.large_packets),
        func.sum(Transportation.overlarge_packets)
    ).join(Field).filter(Field.user_id == current_user["id"]).first()

    if transport_data:
        total_transported = (transport_data[0] or 0) + (transport_data[1] or 0) + (transport_data[2] or 0) + (transport_data[3] or 0)
    else:
        total_transported = 0

    # Get weather forecast
    weather_forecast = get_weather_forecast()

    return {
        "total_fields": total_fields or 0,
        "total_yield": total_yield,
        "total_transported": total_transported,
        "potato_types": {
            "large": total_large,
            "medium": total_medium,
            "small": total_small,
            "overlarge": total_overlarge
        },
        "total_labour_cost": total_labour_cost or 0,
        "total_expenses": total_expenses or 0,
        "total_earnings": total_earnings,
        "profit_loss": profit_loss,
        "weather_forecast": weather_forecast
    }

@router.get("/graphs")
def get_graph_data(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Get potato type totals first
    yield_data = db.query(
        func.sum(Yield.large),
        func.sum(Yield.medium), 
        func.sum(Yield.small),
        func.sum(Yield.overlarge)
    ).join(Field).filter(Field.user_id == current_user["id"]).first()
    
    if yield_data:
        total_large = yield_data[0] or 0
        total_medium = yield_data[1] or 0
        total_small = yield_data[2] or 0
        total_overlarge = yield_data[3] or 0
    else:
        total_large = total_medium = total_small = total_overlarge = 0

    # Yield by field with potato types
    yield_by_field = db.query(
        Field.field_name,
        func.sum(Yield.large),
        func.sum(Yield.medium),
        func.sum(Yield.small),
        func.sum(Yield.overlarge)
    ).join(Yield).filter(Field.user_id == current_user["id"]).group_by(Field.id).all()

    # Format yield data for frontend
    yield_by_field_formatted = []
    for field_name, large, medium, small, overlarge in yield_by_field:
        total = (large or 0) + (medium or 0) + (small or 0) + (overlarge or 0)
        yield_by_field_formatted.append([field_name, total])

    # Yield by potato type
    yield_by_type = [
        ["Large", total_large],
        ["Medium", total_medium], 
        ["Small", total_small],
        ["Overlarge", total_overlarge]
    ]

    # Expenses by type
    expenses_by_type = db.query(
        MoneyRecord.payment_method, 
        func.sum(MoneyRecord.amount)
    ).filter(MoneyRecord.user_id == current_user["id"]).group_by(MoneyRecord.payment_method).all()

    # Labour cost trends
    labour_cost_trends = db.query(
        Task.start_date, 
        func.sum(Task.rate)
    ).join(Field).filter(Field.user_id == current_user["id"]).group_by(Task.start_date).all()

    return {
        "yield_by_field": yield_by_field_formatted,
        "yield_by_type": yield_by_type,
        "expenses_by_type": expenses_by_type,
        "labour_cost_trends": labour_cost_trends
    }
