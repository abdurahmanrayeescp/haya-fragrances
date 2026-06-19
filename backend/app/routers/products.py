from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.product import Product
from app.schemas.product_schema import ProductCreate, ProductUpdate, ProductResponse
from app.utils.pagination import PaginatedParams, PaginatedResponse
from app.utils.filters import ProductFilter
from app.dependencies import get_admin_user
from app.models.user import User

router = APIRouter(tags=["Products"])

@router.get("", response_model=PaginatedResponse[ProductResponse])
def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    page: int = 1,
    size: int = 12,
    db: Session = Depends(get_db)
):
    params = PaginatedParams(page=page, size=size)
    
    # Base query
    query = db.query(Product)
    
    # Apply filtering and sorting
    query = ProductFilter.apply_filters(
        query=query,
        search=search,
        category=category,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by
    )
    
    total = query.count()
    items = query.offset(params.offset).limit(params.size).all()
    
    return PaginatedResponse.create(items=items, total=total, params=params)

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fragrance product not found"
        )
    
    # Find related products (same category or brand, excluding current)
    related = db.query(Product).filter(
        Product.category == product.category,
        Product.id != product.id
    ).limit(4).all()
    
    return {
        "product": product,
        "related": related
    }

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    new_product = Product(**payload.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fragrance product not found"
        )
        
    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, val)
        
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fragrance product not found"
        )
    db.delete(product)
    db.commit()
    return None
