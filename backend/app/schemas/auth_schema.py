from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBrief(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBrief

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
