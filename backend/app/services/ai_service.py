from typing import List, Dict, Any
import os
import json
import httpx
from sqlalchemy.orm import Session
from app.models.product import Product

class AIService:
    @staticmethod
    def get_recommendations(
        db: Session,
        gender: str,
        occasion: str,
        preferred_notes: List[str],
        strength: str
    ) -> List[Product]:
        """
        Calculates match scores for products in database based on user quiz responses
        and returns the top recommended perfume models.
        """
        all_products = db.query(Product).all()
        scored_products = []

        # Convert input notes to lowercase for comparison
        pref_notes_lower = [note.lower().strip() for note in preferred_notes]

        for product in all_products:
            score = 0

            # 1. Gender Match (High weight)
            # Products can be Unisex, Men, Women, or Luxury Collection (which can suit anyone)
            prod_cat_lower = product.category.lower()
            gender_lower = gender.lower()

            if gender_lower == "unisex" or prod_cat_lower == "unisex":
                score += 20
            elif gender_lower in prod_cat_lower:
                score += 30
            elif "luxury" in prod_cat_lower:
                score += 15

            # 2. Notes Match (High weight)
            # Match product.notes (comma separated list) and product.description
            prod_notes = []
            if product.notes:
                prod_notes = [n.lower().strip() for n in product.notes.split(",")]
            
            for pref_note in pref_notes_lower:
                # Direct match in notes list
                if any(pref_note in pn for pn in prod_notes):
                    score += 25
                # Partial match in description
                elif product.description and pref_note in product.description.lower():
                    score += 10

            # 3. Occasion Match (Medium weight)
            # Match typical fragrance notes/categories or description content for occasion
            desc_lower = product.description.lower() if product.description else ""
            if occasion.lower() == "night out":
                # Night out fragrances are usually spicy, oriental, woody, intense
                if any(x in desc_lower or x in product.notes.lower() for x in ["spicy", "amber", "vanilla", "musk", "woody", "night", "evening"]):
                    score += 15
            elif occasion.lower() == "daily":
                # Daily fragrances are usually fresh, clean, citrus, light
                if any(x in desc_lower or x in product.notes.lower() for x in ["fresh", "citrus", "clean", "light", "aquatic", "daily", "office"]):
                    score += 15
            elif occasion.lower() == "formal":
                # Formal fragrances are luxury, leather, oud, patchouli, elegant
                if any(x in desc_lower or x in product.notes.lower() for x in ["leather", "oud", "patchouli", "elegant", "sophisticated", "formal"]):
                    score += 15
            elif occasion.lower() == "sport":
                # Sport fragrances are aquatic, citrus, fresh, mint
                if any(x in desc_lower or x in product.notes.lower() for x in ["sport", "aquatic", "mint", "citrus", "fresh", "breeze"]):
                    score += 15

            # 4. Strength Match (Medium weight)
            # "Subtle" -> clean, fresh, light, colon, edt
            # "Moderate" -> edp, musk, rose, floral
            # "Intense" -> parfum, oud, intense, strong, leather
            strength_lower = strength.lower()
            if strength_lower == "subtle":
                if any(x in desc_lower or x in product.notes.lower() for x in ["light", "fresh", "clean", "citrus", "edt"]):
                    score += 10
            elif strength_lower == "moderate":
                if any(x in desc_lower or x in product.notes.lower() for x in ["moderate", "balanced", "edp", "floral"]):
                    score += 10
            elif strength_lower == "intense":
                if any(x in desc_lower or x in product.notes.lower() for x in ["intense", "parfum", "oud", "strong", "leather"]):
                    score += 15

            # Include product only if it scored above a minimum threshold or if it is a reasonable fit
            if score > 0:
                scored_products.append((product, score))

        # Sort by score descending and return top 4 matches
        scored_products.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in scored_products[:4]]

    @staticmethod
    def get_memory_recommendations(db: Session, memory: str) -> Dict[str, Any]:
        """
        Processes memory using OpenAI if key exists, else falls back to keyword analysis.
        Then scores products against the results to suggest the top 3 fragrance matches.
        """
        api_key = os.getenv("OPENAI_API_KEY")
        emotions = []
        notes = []
        description = ""

        if api_key:
            try:
                system_prompt = (
                    "You are a luxury perfume concierge AI. Analyze the user's memory, emotion, place, or experience, "
                    "and transform it into:\n"
                    "1. A list of 3-4 lowercase emotions (e.g. ['nostalgic', 'warm', 'comforting'])\n"
                    "2. A list of 3-5 scent notes that represent this memory (e.g. ['coffee', 'vanilla', 'amber', 'sandalwood'])\n"
                    "3. A poetic, luxury scent description (2-3 sentences max) linking the memory to these scent notes.\n\n"
                    "Your response must be a single valid JSON object with the exact keys: 'emotions', 'notes', and 'description'."
                )
                
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"The memory: {memory}"}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.7
                }
                
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(
                        "https://api.openai.com/v1/chat/completions",
                        json=payload,
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json"
                        }
                    )
                    resp.raise_for_status()
                    res_json = resp.json()
                    content = res_json["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    
                    emotions = parsed.get("emotions", [])
                    notes = parsed.get("notes", [])
                    description = parsed.get("description", "")
            except Exception:
                # Fallback on any error (parsing, API network, etc.)
                pass

        if not emotions or not notes or not description:
            fallback = AIService._analyze_memory_fallback(memory)
            emotions = fallback["emotions"]
            notes = fallback["notes"]
            description = fallback["description"]

        # Product matching and scoring
        all_products = db.query(Product).all()
        scored_products = []
        
        suggested_notes_lower = [n.lower().strip() for n in notes]
        suggested_emotions_lower = [e.lower().strip() for e in emotions]

        for product in all_products:
            score = 0

            # 1. Notes Overlap
            prod_notes = []
            if product.notes:
                prod_notes = [n.lower().strip() for n in product.notes.split(",")]
            
            for sug_note in suggested_notes_lower:
                # Check for direct overlaps
                if any(sug_note in pn or pn in sug_note for pn in prod_notes):
                    score += 35
                # Check description matches
                elif product.description and sug_note in product.description.lower():
                    score += 12

            # 2. Category Similarity
            if product.category.lower() in ["unisex", "luxury collection"]:
                score += 15

            # 3. Emotional Similarity matches in description
            if product.description:
                desc_lower = product.description.lower()
                for emotion in suggested_emotions_lower:
                    if emotion in desc_lower:
                        score += 15
                    elif emotion.endswith("ing") and emotion[:-3] in desc_lower:
                        score += 10
                    elif emotion.endswith("ed") and emotion[:-2] in desc_lower:
                        score += 10

            # Compute match percentage (range 75% - 98%)
            match_percentage = min(98, max(75, 75 + int(score / 2.5)))

            scored_products.append({
                "product": product,
                "score": score,
                "match_percentage": match_percentage
            })

        # Sort descending and return top 3
        scored_products.sort(key=lambda x: x["score"], reverse=True)
        top_matches = scored_products[:3]

        recommendations = []
        for match in top_matches:
            prod = match["product"]
            recommendations.append({
                "id": prod.id,
                "name": prod.name,
                "brand": prod.brand,
                "category": prod.category,
                "description": prod.description,
                "notes": prod.notes,
                "price": prod.price,
                "image_url": prod.image_url,
                "rating": prod.rating,
                "match_percentage": match["match_percentage"]
            })

        return {
            "emotions": emotions,
            "notes": notes,
            "description": description,
            "recommendations": recommendations
        }

    @staticmethod
    def _analyze_memory_fallback(memory: str) -> Dict[str, Any]:
        """
        Intelligent fallback analysis based on keywords.
        """
        memory_lower = memory.lower()
        
        keyword_rules = [
            {
                "keywords": ["rain", "storm", "wet", "water", "shower", "cloud"],
                "notes": ["aquatic notes", "fresh notes", "musk", "coffee", "patchouli"],
                "emotions": ["nostalgic", "comforting", "peaceful", "reflective"],
                "desc": "rain-slicked streets and cozy indoor retreats"
            },
            {
                "keywords": ["coffee", "cafe", "book", "library", "reading", "tea", "novel", "jazz"],
                "notes": ["coffee", "vanilla", "amber", "sandalwood", "cedarwood"],
                "emotions": ["cozy", "warm", "intellectual", "relaxed"],
                "desc": "the rich aroma of freshly brewed coffee, old parchment, and cozy warmth"
            },
            {
                "keywords": ["beach", "ocean", "sea", "coast", "sand", "sunset", "sun", "marine", "shore"],
                "notes": ["sea salt", "citrus", "marine notes", "coconut", "amber"],
                "emotions": ["relaxing", "free", "warm", "joyful"],
                "desc": "sun-warmed skin, salty sea breezes, and golden ocean sunsets"
            },
            {
                "keywords": ["forest", "wood", "woods", "pine", "tree", "nature", "mountain", "moss", "earth"],
                "notes": ["pine", "cedarwood", "moss", "vetiver", "sandalwood"],
                "emotions": ["grounded", "peaceful", "adventurous", "fresh"],
                "desc": "dense evergreen forests, damp forest floor, and clean mountain air"
            },
            {
                "keywords": ["wedding", "marriage", "love", "romance", "bride", "groom", "rose", "flower", "bouquet"],
                "notes": ["rose", "jasmine", "white musk", "ylang-ylang", "amber"],
                "emotions": ["romantic", "elegant", "joyful", "timeless"],
                "desc": "a celebration of love, fresh floral bouquets of rose and jasmine, and elegant warmth"
            },
            {
                "keywords": ["hotel", "lobby", "dubai", "luxury", "luxe", "gold", "palace", "opulent"],
                "notes": ["amber", "oud wood", "saffron", "cardamom", "rosewood"],
                "emotions": ["luxurious", "opulent", "sophisticated", "exclusive"],
                "desc": "the opulence of a luxury hotel lobby, with rich resins, amber, and precious woods"
            },
            {
                "keywords": ["mosque", "fajr", "prayer", "peaceful", "quiet", "temple", "spiritual", "morning", "dawn", "serene"],
                "notes": ["white musk", "oud wood", "sandalwood", "amber", "rosewater"],
                "emotions": ["serene", "spiritual", "peaceful", "pure", "calm"],
                "desc": "a serene dawn, early morning light, and peaceful reflection inside holy spaces"
            }
        ]

        matched_notes = []
        matched_emotions = []
        matched_descriptions = []

        for rule in keyword_rules:
            for kw in rule["keywords"]:
                if kw in memory_lower:
                    for note in rule["notes"]:
                        if note not in matched_notes:
                            matched_notes.append(note)
                    for emotion in rule["emotions"]:
                        if emotion not in matched_emotions:
                            matched_emotions.append(emotion)
                    matched_descriptions.append(rule["desc"])
                    break

        if not matched_notes:
            notes = ["vanilla", "amber", "sandalwood", "bergamot"]
            emotions = ["warm", "comforting", "elegant"]
            description = (
                "This memory evokes a feeling of quiet personal reflection. "
                "A comforting blend of warm amber, creamy vanilla, and woody notes creates "
                "a scent of timeless elegance."
            )
        else:
            notes = matched_notes[:5]
            emotions = matched_emotions[:4]
            
            desc_combined = " and ".join(matched_descriptions[:2])
            if len(matched_descriptions) > 2:
                desc_combined = ", ".join(matched_descriptions[:2]) + ", and " + matched_descriptions[2]

            description = (
                f"This memory evokes the atmosphere of {desc_combined}. "
                f"Notes of {', '.join(notes[:-1])} and {notes[-1]} blend to capture "
                f"a profile reflecting {', '.join(emotions[:-1])} and {emotions[-1]}."
            )

        return {
            "emotions": emotions,
            "notes": notes,
            "description": description
        }
