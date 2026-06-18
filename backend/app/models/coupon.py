from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.database import Base

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False) # e.g. "WELCOME10"
    discount = Column(Float, nullable=False) # e.g. 0.10 for 10% off
    expiry_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
