from typing import Generic, TypeVar, List
from pydantic import BaseModel
import math

T = TypeVar("T")

class PaginatedParams:
    def __init__(self, page: int = 1, size: int = 12):
        self.page = max(1, page)
        self.size = max(1, min(100, size))
        self.offset = (self.page - 1) * self.size

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def create(cls, items: List[T], total: int, params: PaginatedParams):
        pages = math.ceil(total / params.size) if params.size > 0 else 0
        return cls(
            items=items,
            total=total,
            page=params.page,
            size=params.size,
            pages=pages
        )
