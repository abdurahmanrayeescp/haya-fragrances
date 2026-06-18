from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

class ProductBase(BaseModel):
    name: str
    brand: str
    category: str
    description: str
    notes: Optional[str] = None # comma separated, e.g. "Bergamot, Rose, Cedar"
    price: float
    stock: int
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    rating: Optional[float] = None

class ProductResponse(ProductBase):
    id: int
    rating: float
    created_at: datetime

    class Config:
        from_attributes = True
