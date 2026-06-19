from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.wishlist import Wishlist
from app.schemas.product_schema import ProductResponse
from app.dependencies import get_current_user

router = APIRouter(tags=["Wishlist"])

@router.get("", response_model=List[ProductResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    # Return associated products
    return [item.product for item in items if item.product is not None]

@router.post("/{product_id}", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if already in wishlist
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    
    if existing:
        return {"message": "Product already in wishlist"}
        
    wish = Wishlist(user_id=current_user.id, product_id=product_id)
    db.add(wish)
    db.commit()
    return {"message": "Product added to wishlist"}

@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wish = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    
    if not wish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist record not found"
        )
        
    db.delete(wish)
    db.commit()
    return {"message": "Product removed from wishlist"}
