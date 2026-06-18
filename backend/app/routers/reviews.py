from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from app.schemas.review_schema import ReviewCreate, ReviewResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    # Verify product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    return reviews

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
        
    # Check if user already reviewed this product
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == payload.product_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this product"
        )

    # Save review
    new_review = Review(
        user_id=current_user.id,
        product_id=payload.product_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Recalculate and update aggregate product rating
    all_reviews = db.query(Review).filter(Review.product_id == payload.product_id).all()
    avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
    product.rating = round(avg_rating, 1)
    
    db.commit()
    db.refresh(new_review)

    return new_review
