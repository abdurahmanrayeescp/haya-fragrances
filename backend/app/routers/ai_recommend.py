from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.schemas.product_schema import ProductResponse
from app.services.ai_service import AIService

router = APIRouter(tags=["AI"])

class RecommendationQuizRequest(BaseModel):
    gender: str # e.g. "Men", "Women", "Unisex"
    occasion: str # e.g. "Daily", "Night Out", "Formal", "Sport"
    preferred_notes: List[str] # e.g. ["Woody", "Citrus", "Spicy"]
    strength: str # e.g. "Subtle", "Moderate", "Intense"

@router.post("/recommend", response_model=List[ProductResponse])
def get_fragrance_recommendations(
    payload: RecommendationQuizRequest,
    db: Session = Depends(get_db)
):
    recommendations = AIService.get_recommendations(
        db=db,
        gender=payload.gender,
        occasion=payload.occasion,
        preferred_notes=payload.preferred_notes,
        strength=payload.strength
    )
    return recommendations
