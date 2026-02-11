from sqlalchemy import Column, Integer, String, Date, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class LotNumber(Base):
    __tablename__ = "lot_numbers"

    id = Column(Integer, primary_key=True, index=True)
    lot_number = Column(String(50), index=True, nullable=False)
    field_name = Column(String(100), nullable=False)
    small_packets = Column(Integer, default=0)
    medium_packets = Column(Integer, default=0)
    large_packets = Column(Integer, default=0)
    xlarge_packets = Column(Integer, default=0)
    storage_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationship to user
    user = relationship("User", back_populates="lot_numbers")

    @property
    def total_packets(self):
        return self.small_packets + self.medium_packets + self.large_packets + self.xlarge_packets

    def __repr__(self):
        return f"<LotNumber(id={self.id}, lot_number='{self.lot_number}', field='{self.field_name}', total_packets={self.total_packets}, user_id={self.user_id})>"
