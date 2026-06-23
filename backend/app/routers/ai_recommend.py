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

class MemoryFinderRequest(BaseModel):
    memory: str

class MemoryRecommendation(BaseModel):
    id: int
    name: str
    brand: str
    category: str
    description: str
    notes: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    rating: float
    match_percentage: int

    class Config:
        from_attributes = True

class MemoryFinderResponse(BaseModel):
    emotions: List[str]
    notes: List[str]
    description: str
    recommendations: List[MemoryRecommendation]

@router.post("/memory-finder", response_model=MemoryFinderResponse)
def post_memory_finder(
    payload: MemoryFinderRequest,
    db: Session = Depends(get_db)
):
    """
    POST endpoint to parse user memories, emotion, and experiences into fragrance notes
    and emotional profile, and return the best matching fragrance products from the database.
    """
    result = AIService.get_memory_recommendations(db=db, memory=payload.memory)
    return result
