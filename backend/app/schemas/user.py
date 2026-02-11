from pydantic import BaseModel

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):  # Add this schema for login
    username: str
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True  # Updated for Pydantic v2
