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

    @staticmethod
    def analyze_voice_transcript(db: Session, transcript: str) -> Dict[str, Any]:
        """
        Analyzes voice transcript using OpenAI if key exists, else falls back to keyword analysis.
        Scores and returns recommended products.
        """
        api_key = os.getenv("OPENAI_API_KEY")
        moods = []
        energy = ""
        confidence_score = 0
        occasion = ""
        notes = []
        description = ""

        if api_key:
            try:
                system_prompt = (
                    "You are a luxury perfume concierge AI. Analyze the user's spoken voice transcript "
                    "and transform it into:\n"
                    "1. A list of 2-3 lowercase moods (e.g. ['confident', 'professional', 'focused'])\n"
                    "2. An energy level string (e.g. 'high', 'moderate', 'relaxed')\n"
                    "3. A confidence score integer between 75 and 98\n"
                    "4. An occasion string (e.g. 'Office', 'Date Night', 'Wedding', 'Travel', 'Luxury Event', 'Daily Wear')\n"
                    "5. A list of 3-5 scent notes that suit this transcript (e.g. ['amber', 'woody', 'musk'])\n"
                    "6. A poetic, luxury scent description (2-3 sentences max) linking the moods and energy to notes.\n\n"
                    "Your response must be a single valid JSON object with the exact keys: "
                    "'moods', 'energy', 'confidence_score', 'occasion', 'notes', and 'description'."
                )
                
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"The voice transcript: {transcript}"}
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
                    
                    moods = parsed.get("moods", [])
                    energy = parsed.get("energy", "moderate")
                    confidence_score = parsed.get("confidence_score", 85)
                    occasion = parsed.get("occasion", "Daily Wear")
                    notes = parsed.get("notes", [])
                    description = parsed.get("description", "")
            except Exception:
                pass

        if not moods or not notes or not description:
            fallback = AIService._analyze_voice_fallback(transcript)
            moods = fallback["moods"]
            energy = fallback["energy"]
            confidence_score = fallback["confidence_score"]
            occasion = fallback["occasion"]
            notes = fallback["notes"]
            description = fallback["description"]

        # Product matching and scoring
        all_products = db.query(Product).all()
        scored_products = []

        suggested_notes_lower = [n.lower().strip() for n in notes]
        suggested_moods_lower = [m.lower().strip() for m in moods]
        occasion_lower = occasion.lower()

        for product in all_products:
            score = 0

            # 1. Notes Match (+35 points)
            prod_notes = []
            if product.notes:
                prod_notes = [n.lower().strip() for n in product.notes.split(",")]
            
            for sug_note in suggested_notes_lower:
                if any(sug_note in pn or pn in sug_note for pn in prod_notes):
                    score += 35
                elif product.description and sug_note in product.description.lower():
                    score += 12

            # 2. Emotion/Mood Match (+20 points)
            if product.description:
                desc_lower = product.description.lower()
                for mood in suggested_moods_lower:
                    if mood in desc_lower:
                        score += 20
                    elif mood.endswith("ing") and mood[:-3] in desc_lower:
                        score += 15
                    elif mood.endswith("ed") and mood[:-2] in desc_lower:
                        score += 15

            # 3. Occasion Match (+20 points)
            if product.description and occasion_lower in product.description.lower():
                score += 20
            
            if product.notes:
                prod_notes_str = product.notes.lower()
                if occasion_lower == "office" and any(x in prod_notes_str or (product.description and x in product.description.lower()) for x in ["cedar", "vetiver", "sandalwood", "clean", "fresh"]):
                    score += 20
                elif occasion_lower == "date night" and any(x in prod_notes_str or (product.description and x in product.description.lower()) for x in ["amber", "vanilla", "spicy", "musk", "rose"]):
                    score += 20
                elif occasion_lower == "wedding" and any(x in prod_notes_str or (product.description and x in product.description.lower()) for x in ["jasmine", "rose", "white musk", "orange blossom"]):
                    score += 20
                elif occasion_lower == "travel" and any(x in prod_notes_str or (product.description and x in product.description.lower()) for x in ["citrus", "marine", "fresh", "mint", "sea salt"]):
                    score += 20

            # 4. Luxury Collection Bonus (+15 points)
            if product.category.lower() == "luxury collection":
                score += 15

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
            "transcript": transcript,
            "moods": moods,
            "energy": energy,
            "confidence_score": confidence_score,
            "occasion": occasion,
            "notes": notes,
            "description": description,
            "recommendations": recommendations
        }

    @staticmethod
    def _analyze_voice_fallback(transcript: str) -> Dict[str, Any]:
        """
        Intelligent fallback analyzer for voice transcript.
        """
        transcript_lower = transcript.lower()

        keyword_rules = [
            {
                "keywords": ["romantic", "dinner", "partner", "date", "night out", "love"],
                "moods": ["romantic", "passionate", "intimate"],
                "energy": "relaxed",
                "confidence_score": 89,
                "occasion": "Date Night",
                "notes": ["rose", "vanilla", "amber", "musk"],
                "desc": "a warm, romantic date night"
            },
            {
                "keywords": ["meeting", "work", "business", "office", "professional", "interview", "powerful"],
                "moods": ["confident", "professional", "focused"],
                "energy": "high",
                "confidence_score": 92,
                "occasion": "Office",
                "notes": ["cedarwood", "sandalwood", "vetiver", "bergamot"],
                "desc": "a structured and powerful professional business environment"
            },
            {
                "keywords": ["wedding", "celebration", "ceremony", "marriage", "bridal"],
                "moods": ["elegant", "joyful", "timeless"],
                "energy": "moderate",
                "confidence_score": 95,
                "occasion": "Wedding",
                "notes": ["jasmine", "rose", "white musk", "orange blossom"],
                "desc": "an elegant wedding celebration"
            },
            {
                "keywords": ["beach", "ocean", "sea", "coast", "sand", "summer", "hot"],
                "moods": ["relaxed", "adventurous", "fresh"],
                "energy": "high",
                "confidence_score": 88,
                "occasion": "Travel",
                "notes": ["sea salt", "citrus", "marine notes", "coconut"],
                "desc": "a sun-drenched day by the sea"
            },
            {
                "keywords": ["rain", "rainy", "storm", "winter", "cold", "books", "coffee"],
                "moods": ["nostalgic", "reflective", "cozy"],
                "energy": "relaxed",
                "confidence_score": 90,
                "occasion": "Daily Wear",
                "notes": ["patchouli", "coffee", "amber", "cinnamon"],
                "desc": "a cozy and reflective rainy day"
            }
        ]

        matched_moods = []
        matched_notes = []
        matched_descriptions = []
        
        # Defaults
        energy = "moderate"
        confidence_score = 85
        occasion = "Daily Wear"

        for rule in keyword_rules:
            for kw in rule["keywords"]:
                if kw in transcript_lower:
                    for mood in rule["moods"]:
                        if mood not in matched_moods:
                            matched_moods.append(mood)
                    for note in rule["notes"]:
                        if note not in matched_notes:
                            matched_notes.append(note)
                    matched_descriptions.append(rule["desc"])
                    if energy == "moderate" and confidence_score == 85:
                        energy = rule["energy"]
                        confidence_score = rule["confidence_score"]
                        occasion = rule["occasion"]
                    break

        if not matched_notes:
            moods = ["elegant", "calm"]
            energy = "moderate"
            confidence_score = 85
            occasion = "Daily Wear"
            notes = ["vanilla", "bergamot", "musk", "amber"]
            description = "A balanced fragrance composition conveying subtle elegance and calm, ideal for daily wear."
        else:
            moods = matched_moods[:3]
            notes = matched_notes[:5]
            
            desc_combined = " and ".join(matched_descriptions[:2])
            if len(matched_descriptions) > 2:
                desc_combined = ", ".join(matched_descriptions[:2]) + ", and " + matched_descriptions[2]

            description = (
                f"Your voice suggests a mood of {', '.join(moods[:-1])} and {moods[-1]}, "
                f"reflecting {energy} energy well-suited for {desc_combined}. "
                f"We suggest a blend emphasizing {', '.join(notes[:-1])} and {notes[-1]}."
            )

        return {
            "moods": moods,
            "energy": energy,
            "confidence_score": confidence_score,
            "occasion": occasion,
            "notes": notes,
            "description": description
        }

    @staticmethod
    def create_perfume_concept(db: Session, description: str) -> Dict[str, Any]:
        """
        Creates a custom luxury perfume concept using OpenAI if key exists, else falls back to keyword analysis.
        """
        api_key = os.getenv("OPENAI_API_KEY")
        
        perfume_name = ""
        story = ""
        slogan = ""
        top_notes = []
        middle_notes = []
        base_notes = []
        bottle_style = ""
        bottle_color = ""
        packaging_style = ""
        target_audience = ""
        luxury_score = 0
        image_prompt = ""

        if api_key:
            try:
                system_prompt = (
                    "You are a master luxury perfumer and bottle designer. Analyze the user's inspiration "
                    "(memory, mood, place, person, or occasion) and create a completely new, unique luxury perfume concept.\n\n"
                    "Your response must be a single valid JSON object with the exact keys:\n"
                    "- 'perfume_name': A creative luxury perfume name (e.g. 'Monsoon Noir')\n"
                    "- 'story': A poetic brand story explaining the inspiration (2-3 sentences)\n"
                    "- 'slogan': A catchy luxury marketing slogan (e.g. 'Whispers of the rain, warmth of the soul')\n"
                    "- 'top_notes': A list of 2-3 top notes (e.g. ['bergamot', 'petrichor'])\n"
                    "- 'middle_notes': A list of 2-3 middle notes (e.g. ['coffee', 'rose'])\n"
                    "- 'base_notes': A list of 2-3 base notes (e.g. ['sandalwood', 'amber'])\n"
                    "- 'bottle_style': A brief description of the luxury bottle design (e.g. 'sleek octagonal crystal with brass fittings')\n"
                    "- 'bottle_color': The primary color of the bottle (e.g. 'emerald green')\n"
                    "- 'packaging_style': A brief description of the outer box/packaging style\n"
                    "- 'target_audience': The targeted demographic (e.g. 'Modern poets and dreamers')\n"
                    "- 'luxury_score': A calculated luxury score integer from 70 to 100\n"
                    "- 'image_prompt': A highly detailed text-to-image prompt to generate this bottle. It MUST follow this template: "
                    "'A luxury [bottle_color] perfume bottle with gold cap, [bottle_style] design, Dior-level elegance, cinematic lighting, premium product photography, black background'"
                )
                
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"The inspiration: {description}"}
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
                    
                    perfume_name = parsed.get("perfume_name", "")
                    story = parsed.get("story", "")
                    slogan = parsed.get("slogan", "")
                    top_notes = parsed.get("top_notes", [])
                    middle_notes = parsed.get("middle_notes", [])
                    base_notes = parsed.get("base_notes", [])
                    bottle_style = parsed.get("bottle_style", "")
                    bottle_color = parsed.get("bottle_color", "")
                    packaging_style = parsed.get("packaging_style", "")
                    target_audience = parsed.get("target_audience", "")
                    luxury_score = parsed.get("luxury_score", 95)
                    image_prompt = parsed.get("image_prompt", "")
            except Exception:
                pass

        if not perfume_name or not story or not slogan or not top_notes:
            fallback = AIService._create_perfume_concept_fallback(description)
            perfume_name = fallback["perfume_name"]
            story = fallback["story"]
            slogan = fallback["slogan"]
            top_notes = fallback["top_notes"]
            middle_notes = fallback["middle_notes"]
            base_notes = fallback["base_notes"]
            bottle_style = fallback["bottle_style"]
            bottle_color = fallback["bottle_color"]
            packaging_style = fallback["packaging_style"]
            target_audience = fallback["target_audience"]
            luxury_score = fallback["luxury_score"]
            image_prompt = fallback["image_prompt"]

        return {
            "perfume_name": perfume_name,
            "story": story,
            "slogan": slogan,
            "top_notes": top_notes,
            "middle_notes": middle_notes,
            "base_notes": base_notes,
            "bottle_style": bottle_style,
            "bottle_color": bottle_color,
            "packaging_style": packaging_style,
            "target_audience": target_audience,
            "luxury_score": luxury_score,
            "image_prompt": image_prompt
        }

    @staticmethod
    def _create_perfume_concept_fallback(description: str) -> Dict[str, Any]:
        """
        Keyword-based fallback for luxury perfume concept generation.
        """
        desc_lower = description.lower()
        
        keyword_rules = [
            {
                "keywords": ["rain", "storm", "wet", "water", "kerala"],
                "perfume_name": "Monsoon Noir",
                "top_notes": ["Bergamot", "Petrichor", "Green Tea"],
                "middle_notes": ["Coffee Accord", "Cardamom", "Rosewater"],
                "base_notes": ["Patchouli", "Sandalwood", "Amber"],
                "bottle_style": "heavyweight octagonal crystal flask",
                "bottle_color": "emerald green",
                "packaging_style": "textured black matte outer box with gold leaf foil detailing",
                "target_audience": "Nostalgic souls and lovers of quiet mornings",
                "luxury_score": 95,
                "slogan": "Whispers of the rain, warmth of the soul.",
                "story": "Inspired by the lush, rain-drenched evenings of southern India. Deep petrichor blends with coffee accords to evoke a private veranda overlooking monsoon-swept hills."
            },
            {
                "keywords": ["beach", "ocean", "sea", "sand", "coast", "summer", "sunset"],
                "perfume_name": "Sable D'Or",
                "top_notes": ["Sea Salt", "Bergamot", "Coconut Water"],
                "middle_notes": ["Orange Blossom", "Ylang-Ylang", "Frangipani"],
                "base_notes": ["Amber", "Sandalwood", "White Musk"],
                "bottle_style": "frosted circular glass with gold ripples",
                "bottle_color": "warm amber gold",
                "packaging_style": "linen-textured cream box with debossed gold branding",
                "target_audience": "Vibrant sun-seekers and luxury travelers",
                "luxury_score": 92,
                "slogan": "Sun-drenched skin, endless horizons.",
                "story": "Capturing the serene warmth of a beach sunset. Creamy coconut and bright citrus merge with sea salt notes to recall sun-warmed skin and warm ocean breezes."
            },
            {
                "keywords": ["forest", "wood", "tree", "woods", "nature", "pine", "mountain"],
                "perfume_name": "Sylva Mystique",
                "top_notes": ["Pine Needle", "Bergamot", "Eucalyptus"],
                "middle_notes": ["Cedarwood", "Violet Leaves", "Cypress"],
                "base_notes": ["Oakmoss", "Vetiver", "Sandalwood"],
                "bottle_style": "tall rectangular block with rustic oakwood cap",
                "bottle_color": "forest green",
                "packaging_style": "matte moss-green sleeve box with gold border trim",
                "target_audience": "Nature lovers and sophisticated wanderers",
                "luxury_score": 90,
                "slogan": "The quiet depth of wild sanctuaries.",
                "story": "Deep within the silent evergreen canopy. Rich wood resins and earthy vetiver weave a scent trail of dense pines and damp mountain air."
            },
            {
                "keywords": ["wedding", "marriage", "love", "romance", "bride", "groom", "date"],
                "perfume_name": "Amour Éternel",
                "top_notes": ["Aldehydes", "Bergamot", "Neroli"],
                "middle_notes": ["Damask Rose", "Jasmine Sambac", "White Lily"],
                "base_notes": ["White Musk", "Amber", "Vanilla"],
                "bottle_style": "delicate teardrop flacon with faceted crystal cap",
                "bottle_color": "soft rose gold",
                "packaging_style": "pearly white velvet presentation case with gold lining",
                "target_audience": "Romantics and celebratory souls",
                "luxury_score": 98,
                "slogan": "Two hearts, a single timeless sillage.",
                "story": "A celebration of absolute devotion and romance. A grand bouquet of fresh roses and rich jasmine settles into soft white musk and warm amber."
            },
            {
                "keywords": ["hotel", "lobby", "dubai", "luxury", "luxe", "palace", "gold"],
                "perfume_name": "Palais D'Oud",
                "top_notes": ["Saffron", "Cardamom", "Incense"],
                "middle_notes": ["Oud Wood", "Damask Rose", "Leather"],
                "base_notes": ["Amber", "Patchouli", "Sandalwood"],
                "bottle_style": "regal octagonal glass with gold filigree collar",
                "bottle_color": "regal black and gold",
                "packaging_style": "heavy gold-plated rigid box with silk insert",
                "target_audience": "Connoisseurs of high opulence and bold elegance",
                "luxury_score": 97,
                "slogan": "The scent of absolute opulence.",
                "story": "Inspired by the magnificent lobby of a luxury hotel in Dubai. Precious saffron and rich leather open into a heart of rare oud wood and golden resins."
            }
        ]

        matched_rule = None
        for rule in keyword_rules:
            for kw in rule["keywords"]:
                if kw in desc_lower:
                    matched_rule = rule
                    break
            if matched_rule:
                break

        if not matched_rule:
            matched_rule = {
                "perfume_name": "Aura Privée",
                "top_notes": ["Bergamot", "Neroli", "Pink Pepper"],
                "middle_notes": ["Jasmine", "Rose", "Sandalwood"],
                "base_notes": ["Vanilla", "Amber", "White Musk"],
                "bottle_style": "sleek minimalist cylinder with magnetic gold cap",
                "bottle_color": "crystal clear glass",
                "packaging_style": "minimalist black carton with gold embossing",
                "target_audience": "The modern individual looking for a unique signature",
                "luxury_score": 88,
                "slogan": "Intimate. Unspoken. Uniquely yours.",
                "story": "A bespoke fragrance concept designed to translate a personal, unnamed inspiration into a balanced, timeless olfactory signature."
            }

        image_prompt = (
            f"A luxury {matched_rule['bottle_color']} perfume bottle with gold cap, "
            f"{matched_rule['bottle_style']} design, Dior-level elegance, cinematic lighting, "
            f"premium product photography, black background"
        )

        return {
            "perfume_name": matched_rule["perfume_name"],
            "story": matched_rule["story"],
            "slogan": matched_rule["slogan"],
            "top_notes": matched_rule["top_notes"],
            "middle_notes": matched_rule["middle_notes"],
            "base_notes": matched_rule["base_notes"],
            "bottle_style": matched_rule["bottle_style"],
            "bottle_color": matched_rule["bottle_color"],
            "packaging_style": matched_rule["packaging_style"],
            "target_audience": matched_rule["target_audience"],
            "luxury_score": matched_rule["luxury_score"],
            "image_prompt": image_prompt
        }

    @staticmethod
    def generate_bottle_image(image_prompt: str) -> Dict[str, Any]:
        """
        Generates a perfume bottle image using OpenAI DALL-E if key exists, else falls back to a curated Unsplash match.
        """
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                with httpx.Client(timeout=30.0) as client:
                    resp = client.post(
                        "https://api.openai.com/v1/images/generations",
                        json={
                            "model": "dall-e-3",
                            "prompt": image_prompt,
                            "n": 1,
                            "size": "1024x1024"
                        },
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json"
                        }
                    )
                    resp.raise_for_status()
                    res_json = resp.json()
                    image_url = res_json["data"][0]["url"]
                    return {"image_url": image_url}
            except Exception:
                pass

        prompt_lower = image_prompt.lower()
        
        if "emerald" in prompt_lower or "green" in prompt_lower or "monsoon" in prompt_lower:
            image_url = "https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600"
        elif "rose" in prompt_lower or "wedding" in prompt_lower or "pink" in prompt_lower:
            image_url = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600"
        elif "amber" in prompt_lower or "beach" in prompt_lower or "gold" in prompt_lower:
            image_url = "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600"
        elif "forest" in prompt_lower or "moss" in prompt_lower or "pine" in prompt_lower:
            image_url = "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=600"
        elif "black" in prompt_lower or "hotel" in prompt_lower or "oud" in prompt_lower or "saffron" in prompt_lower:
            image_url = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600"
        else:
            image_url = "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600"

        return {"image_url": image_url}


