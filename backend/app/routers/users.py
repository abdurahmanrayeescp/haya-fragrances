from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserUpdate, UserResponse
from app.dependencies import get_current_user
from app.security import get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.name is not None:
        current_user.name = payload.name
    
    if payload.email is not None:
        # Check if email is already taken by another user
        existing = db.query(User).filter(User.email == payload.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already in use by another account"
            )
        current_user.email = payload.email
        
    if payload.password is not None:
        current_user.hashed_password = get_password_hash(payload.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user
