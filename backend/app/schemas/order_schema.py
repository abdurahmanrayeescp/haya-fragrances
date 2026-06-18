from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from app.schemas.product_schema import ProductResponse

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_method: str
    shipping_address: str
    phone_number: str
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    payment_method: str
    shipping_address: str
    phone_number: str
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str # "Pending", "Processing", "Delivered", "Cancelled"
