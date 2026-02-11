from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class Transportation(Base):
    __tablename__ = "transportations"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False)
    lot_number = Column(String(50), nullable=False)
    transport_date = Column(Date, nullable=False)
    small_packets = Column(Integer, default=0)
    medium_packets = Column(Integer, default=0)
    large_packets = Column(Integer, default=0)
    overlarge_packets = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    field = relationship("Field", back_populates="transportations")

    def __repr__(self):
        return f"<Transportation(id={self.id}, lot_number='{self.lot_number}', field_id={self.field_id}, total_packets={self.total_packets})>"

    @property
    def total_packets(self):
        return (self.small_packets or 0) + (self.medium_packets or 0) + (self.large_packets or 0) + (self.overlarge_packets or 0)
