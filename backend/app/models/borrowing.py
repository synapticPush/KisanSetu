from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class Borrowing(Base):
    __tablename__ = "borrowings"

    id = Column(Integer, primary_key=True, index=True)
    borrower_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    borrow_date = Column(String, nullable=False)
    expected_return_date = Column(String, nullable=True)
    actual_return_date = Column(String, nullable=True)
    status = Column(String, nullable=False, default="pending")  # pending, returned, overdue
    notes = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="borrowings")
