from typing import List, Dict, Any
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
