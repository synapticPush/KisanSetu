from pydantic import BaseModel
from typing import Optional

class FieldBase(BaseModel):
    field_name: str
    location: Optional[str] = None
    area: float
    season: Optional[str] = None
    year: int

class FieldCreate(FieldBase):
    pass

class FieldUpdate(BaseModel):  # Schema for partial updates
    field_name: Optional[str] = None
    location: Optional[str] = None
    area: Optional[float] = None
    season: Optional[str] = None
    year: Optional[int] = None

class FieldResponse(FieldBase):
    id: int
    potato_type: Optional[str] = None  # Keep for backward compatibility
    user_id: int

    class Config:
        from_attributes = True  # Updated for Pydantic v2
