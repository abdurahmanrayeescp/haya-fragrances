from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str

class UserReviewer(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: int
    comment: str
    created_at: datetime
    user: Optional[UserReviewer] = None

    class Config:
        from_attributes = True
