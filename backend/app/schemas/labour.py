from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class LabourGroupBase(BaseModel):
    group_name: str

class LabourGroupCreate(LabourGroupBase):
    pass

class LabourGroupResponse(LabourGroupBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Attendance Schemas
class LabourAttendanceBase(BaseModel):
    labourer_id: int
    attendance_date: date
    status: str  # full, half, absent

class LabourAttendanceCreate(LabourAttendanceBase):
    pass

class LabourAttendanceUpdate(BaseModel):
    status: str

class LabourAttendanceResponse(LabourAttendanceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LabourAttendanceBulkRecord(BaseModel):
    labourer_id: int
    status: str  # full, half, absent

class LabourAttendanceBulkUpsert(BaseModel):
    attendance_date: date
    records: list[LabourAttendanceBulkRecord]

class LabourAttendanceTotalResponse(BaseModel):
    labourer_id: int
    total_days: float

class LabourerBase(BaseModel):
    name: str
    village: str
    daily_wage: float
    phone: Optional[str] = None
    group_id: int

class LabourerCreate(LabourerBase):
    pass

class LabourerUpdate(BaseModel):
    name: Optional[str] = None
    village: Optional[str] = None
    daily_wage: Optional[float] = None
    phone: Optional[str] = None
    group_id: Optional[int] = None

class LabourerResponse(LabourerBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    amount: float
    payment_date: date
    working_days: int
    payment_type: str = "daily"  # daily, weekly, monthly, advance, bonus
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    labourer_id: int

class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    payment_date: Optional[date] = None
    working_days: Optional[int] = None
    payment_type: Optional[str] = None
    notes: Optional[str] = None

class PaymentResponse(PaymentBase):
    id: int
    labourer_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Enhanced Response Schemas with relationships
class LabourerWithGroup(LabourerResponse):
    group: LabourGroupResponse
    
    class Config:
        from_attributes = True

class PaymentWithLabourer(PaymentResponse):
    labourer: LabourerResponse
    
    class Config:
        from_attributes = True

class LabourGroupWithLabourers(LabourGroupResponse):
    labourers: list[LabourerResponse] = []
    
    class Config:
        from_attributes = True

# Legacy Task Schemas (keeping for backward compatibility)
class TaskBase(BaseModel):
    task_name: str
    field_id: int
    group_id: int
    start_date: str
    end_date: str
    payment_type: str
    rate: float

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True

# Group Work Schemas
class GroupWorkBase(BaseModel):
    group_id: int
    work_date: date
    small_packets: int = 0
    medium_packets: int = 0
    large_packets: int = 0
    overlarge_packets: int = 0
    total_packets: int = 0
    notes: Optional[str] = None

class GroupWorkCreate(GroupWorkBase):
    pass

class GroupWorkResponse(GroupWorkBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GroupWorkWithGroup(GroupWorkResponse):
    group: LabourGroupResponse

    class Config:
        from_attributes = True
