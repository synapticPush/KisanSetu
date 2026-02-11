from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db import Base
from app.utils.security import get_password_hash

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # Increased length for bcrypt hashes

    # Relationships
    fields = relationship("Field", back_populates="user")
    borrowings = relationship("Borrowing", back_populates="user")
    money_records = relationship("MoneyRecord", back_populates="user")
    lot_numbers = relationship("LotNumber", back_populates="user")
    labour_groups = relationship("LabourGroup", back_populates="user")
    labourers = relationship("Labourer", back_populates="user")

    def set_password(self, password: str):
        """Hash and set the password."""
        self.password = get_password_hash(password)

    def verify_password(self, password: str) -> bool:
        """Verify the password."""
        from app.utils.security import verify_password
        return verify_password(password, self.password)
