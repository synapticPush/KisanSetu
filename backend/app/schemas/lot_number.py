from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class LotNumberBase(BaseModel):
    lot_number: str
    field_name: str
    small_packets: int = 0
    medium_packets: int = 0
    large_packets: int = 0
    xlarge_packets: int = 0
    storage_date: Optional[date] = None
    notes: Optional[str] = None

class LotNumberCreate(LotNumberBase):
    pass

class LotNumberResponse(LotNumberBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    total_packets: int  # Computed property

    class Config:
        from_attributes = True

class LotNumberUpdate(BaseModel):
    lot_number: Optional[str] = None
    field_name: Optional[str] = None
    small_packets: Optional[int] = None
    medium_packets: Optional[int] = None
    large_packets: Optional[int] = None
    xlarge_packets: Optional[int] = None
    storage_date: Optional[date] = None
    notes: Optional[str] = None

class LotNumberAddPackets(BaseModel):
    small_packets: int = 0
    medium_packets: int = 0
    large_packets: int = 0
    xlarge_packets: int = 0
    notes: Optional[str] = None
