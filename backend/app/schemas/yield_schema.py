from pydantic import BaseModel
from typing import Optional

class YieldBase(BaseModel):
    date: str
    large: Optional[float] = 0
    medium: Optional[float] = 0
    small: Optional[float] = 0
    overlarge: Optional[float] = 0
    notes: Optional[str]

class YieldCreate(YieldBase):
    pass

class YieldUpdate(BaseModel):
    date: Optional[str]
    large: Optional[float]
    medium: Optional[float]
    small: Optional[float]
    overlarge: Optional[float]
    notes: Optional[str]

class YieldResponse(YieldBase):
    id: int
    field_id: int

    class Config:
        from_attributes = True
