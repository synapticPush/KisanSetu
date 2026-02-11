from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BorrowingBase(BaseModel):
    borrower_name: str
    amount: float
    borrow_date: str
    expected_return_date: Optional[str] = None
    actual_return_date: Optional[str] = None
    status: Optional[str] = "pending"
    notes: Optional[str] = None

class BorrowingCreate(BorrowingBase):
    pass

class BorrowingUpdate(BaseModel):
    borrower_name: Optional[str] = None
    amount: Optional[float] = None
    borrow_date: Optional[str] = None
    expected_return_date: Optional[str] = None
    actual_return_date: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class BorrowingResponse(BorrowingBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
