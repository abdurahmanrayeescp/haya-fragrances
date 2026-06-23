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

class VoiceAnalysisRequest(BaseModel):
    transcript: str

class VoiceAnalysisResponse(BaseModel):
    transcript: str
    moods: List[str]
    energy: str
    confidence_score: int
    occasion: str
    notes: List[str]
    description: str
    recommendations: List[MemoryRecommendation]

@router.post("/voice-analysis", response_model=VoiceAnalysisResponse)
def post_voice_analysis(
    payload: VoiceAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    POST endpoint to analyze natural language voice transcripts and recommend matched products.
    """
    result = AIService.analyze_voice_transcript(db=db, transcript=payload.transcript)
    return result

class PerfumeCreatorRequest(BaseModel):
    description: str

class PerfumeCreatorResponse(BaseModel):
    perfume_name: str
    story: str
    slogan: str
    top_notes: List[str]
    middle_notes: List[str]
    base_notes: List[str]
    bottle_style: str
    bottle_color: str
    packaging_style: str
    target_audience: str
    luxury_score: int
    image_prompt: str

class GenerateBottleRequest(BaseModel):
    image_prompt: str

class GenerateBottleResponse(BaseModel):
    image_url: str

@router.post("/perfume-creator", response_model=PerfumeCreatorResponse)
def post_perfume_creator(
    payload: PerfumeCreatorRequest,
    db: Session = Depends(get_db)
):
    """
    POST endpoint to create an entirely new, custom perfume concept based on inspiration text.
    """
    result = AIService.create_perfume_concept(db=db, description=payload.description)
    return result

@router.post("/generate-bottle", response_model=GenerateBottleResponse)
def post_generate_bottle(
    payload: GenerateBottleRequest
):
    """
    POST endpoint to generate a custom bottle design image from an image generation prompt.
    """
    result = AIService.generate_bottle_image(image_prompt=payload.image_prompt)
    return result
