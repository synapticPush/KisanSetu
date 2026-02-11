from pydantic import BaseModel
from typing import Optional

class MoneyRecordBase(BaseModel):
    paid_to: str
    amount: float
    payment_date: str
    payment_method: str
    notes: Optional[str]

class MoneyRecordCreate(MoneyRecordBase):
    pass

class MoneyRecordUpdate(BaseModel):
    paid_to: Optional[str]
    amount: Optional[float]
    payment_date: Optional[str]
    payment_method: Optional[str]
    notes: Optional[str]

class MoneyRecordResponse(MoneyRecordBase):
    id: int

    class Config:
        from_attributes = True
