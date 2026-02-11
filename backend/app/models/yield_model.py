from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Yield(Base):
    __tablename__ = "yields"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(Integer, ForeignKey("fields.id"))
    date = Column(String, nullable=False)
    large = Column(Float, nullable=False, default=0)
    medium = Column(Float, nullable=False, default=0)
    small = Column(Float, nullable=False, default=0)
    overlarge = Column(Float, nullable=False, default=0)
    notes = Column(String, nullable=True)

    # Relationship
    field = relationship("Field", back_populates="yields")
