from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class MoneyRecord(Base):
    __tablename__ = "money_records"

    id = Column(Integer, primary_key=True, index=True)
    paid_to = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    payment_date = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)  # cash, UPI, bank
    notes = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="money_records")
