from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class TransportationBase(BaseModel):
    lot_number: str
    transport_date: Optional[date] = None
    small_packets: int = 0
    medium_packets: int = 0
    large_packets: int = 0
    overlarge_packets: int = 0
    notes: Optional[str] = None

class TransportationCreate(TransportationBase):
    field_id: int

class TransportationResponse(TransportationBase):
    id: int
    field_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_packets: int  # Computed property

    class Config:
        from_attributes = True

class TransportationUpdate(BaseModel):
    lot_number: Optional[str] = None
    transport_date: Optional[date] = None
    small_packets: Optional[int] = None
    medium_packets: Optional[int] = None
    large_packets: Optional[int] = None
    overlarge_packets: Optional[int] = None
    notes: Optional[str] = None
