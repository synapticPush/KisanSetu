from sqlalchemy import Column, Integer, String, ForeignKey, Float, Date, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class LabourGroup(Base):
    __tablename__ = "labour_groups"

    id = Column(Integer, primary_key=True, index=True)
    group_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    labourers = relationship("Labourer", back_populates="group")
    tasks = relationship("Task", back_populates="group")
    user = relationship("User", back_populates="labour_groups")

class Labourer(Base):
    __tablename__ = "labourers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    village = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    daily_wage = Column(Float, nullable=False)
    group_id = Column(Integer, ForeignKey("labour_groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    group = relationship("LabourGroup", back_populates="labourers")
    user = relationship("User", back_populates="labourers")
    payments = relationship("Payment", back_populates="labourer")

class Payment(Base):
    __tablename__ = "labour_payments"

    id = Column(Integer, primary_key=True, index=True)
    labourer_id = Column(Integer, ForeignKey("labourers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_date = Column(Date, nullable=False)
    working_days = Column(Integer, nullable=False)
    payment_type = Column(String, nullable=False, default="daily")  # daily, weekly, monthly, advance, bonus
    notes = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    labourer = relationship("Labourer", back_populates="payments")
    user = relationship("User")

class LabourAttendance(Base):
    __tablename__ = "labour_attendance"
    __table_args__ = (
        UniqueConstraint("user_id", "labourer_id", "attendance_date", name="uq_labour_attendance"),
    )

    id = Column(Integer, primary_key=True, index=True)
    labourer_id = Column(Integer, ForeignKey("labourers.id"), nullable=False)
    attendance_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # full, half, absent
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    labourer = relationship("Labourer")
    user = relationship("User")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, nullable=False)
    field_id = Column(Integer, ForeignKey("fields.id"))
    group_id = Column(Integer, ForeignKey("labour_groups.id"))
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    payment_type = Column(String, nullable=False)  # daily or per_task
    rate = Column(Float, nullable=False)

    # Relationships
    field = relationship("Field", back_populates="tasks")
    group = relationship("LabourGroup", back_populates="tasks")

class GroupWork(Base):
    __tablename__ = "group_work"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("labour_groups.id"), nullable=False)
    work_date = Column(Date, nullable=False)
    small_packets = Column(Integer, default=0)
    medium_packets = Column(Integer, default=0)
    large_packets = Column(Integer, default=0)
    overlarge_packets = Column(Integer, default=0)
    total_packets = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    group = relationship("LabourGroup")
    user = relationship("User")
