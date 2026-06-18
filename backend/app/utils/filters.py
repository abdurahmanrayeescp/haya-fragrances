from typing import Optional
from sqlalchemy import or_
from sqlalchemy.orm import Query
from app.models.product import Product

class ProductFilter:
    @staticmethod
    def apply_filters(
        query: Query,
        search: Optional[str] = None,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: Optional[str] = None # "price_asc", "price_desc", "newest", "rating"
    ) -> Query:
        # Search keyword
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.like(search_pattern),
                    Product.brand.like(search_pattern),
                    Product.description.like(search_pattern),
                    Product.notes.like(search_pattern)
                )
            )

        # Category
        if category:
            query = query.filter(Product.category == category)

        # Brand
        if brand:
            query = query.filter(Product.brand == brand)

        # Price range
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "rating":
            query = query.order_by(Product.rating.desc())
        elif sort_by == "newest":
            query = query.order_by(Product.created_at.desc())
        else:
            query = query.order_by(Product.id.asc())

        return query
