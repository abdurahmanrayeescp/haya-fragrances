from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class CouponBase(BaseModel):
    code: str
    discount: float # e.g. 0.15 for 15% off
    expiry_date: datetime
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: int

    class Config:
        from_attributes = True

class CouponApplyRequest(BaseModel):
    code: str

class CouponApplyResponse(BaseModel):
    code: str
    discount: float
    valid: bool
    message: str
