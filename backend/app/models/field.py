from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Field(Base):
    __tablename__ = "fields"

    id = Column(Integer, primary_key=True, index=True)
    field_name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    area = Column(Float, nullable=False)
    potato_type = Column(String, nullable=True)
    season = Column(String, nullable=True)
    year = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    user = relationship("User", back_populates="fields")
    yields = relationship("Yield", back_populates="field")
    tasks = relationship("Task", back_populates="field")
    transportations = relationship("Transportation", back_populates="field")
