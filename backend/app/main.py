from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
import uvicorn

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.product import Product
from app.models.coupon import Coupon
from app.models.review import Review
from app.security import get_password_hash

# Import routers
from app.routers import auth, users, products, orders, wishlist, reviews, admin, ai_recommend

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LuxeAura API",
    description="Premium Luxury Perfume E-Commerce Platform API",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(ai_recommend.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "name": "LuxeAura API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs"
    }

# Seed database on startup if empty
@app.on_event("startup")
def seed_db():
    db = SessionLocal()
    try:
        # Check if users table is empty
        if db.query(User).count() == 0:
            # Create default admin account
            admin_user = User(
                name="Luxe Admin",
                email="admin@luxeaura.com",
                hashed_password=get_password_hash("Admin123!"),
                role="admin"
            )
            # Create default customer account
            customer_user = User(
                name="Sonia Laurent",
                email="sonia@luxeaura.com",
                hashed_password=get_password_hash("Customer123!"),
                role="user"
            )
            db.add(admin_user)
            db.add(customer_user)
            db.commit()

        # Check if products table is empty
        if db.query(Product).count() == 0:
            products_seed = [
                Product(
                    name="Lost Cherry",
                    brand="Tom Ford",
                    category="Unisex",
                    description="Lost Cherry is a full-bodied journey into the once-forbidden; a contrasting scent that reveals a tempting dichotomy of playful, candy-like gleam on the outside and luscious flesh on the inside.",
                    notes="Black Cherry, Bitter Almond, Griotte Syrup, Turkish Rose, Jasmine Sambac, Roasted Tonka, Sandalwood, Vetiver, Cedar",
                    price=395.0,
                    stock=15,
                    image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
                    rating=4.8
                ),
                Product(
                    name="Bleu de Chanel",
                    brand="Chanel",
                    category="Men",
                    description="An ode to masculine freedom expressed in a woody aromatic fragrance with a captivating trail. A timeless scent housed in a bottle of deep and mysterious blue.",
                    notes="Grapefruit, Lemon, Mint, Pink Pepper, Ginger, Nutmeg, Jasmine, Incense, Vetiver, Cedar, Sandalwood, Patchouli, Labdanum",
                    price=150.0,
                    stock=25,
                    image_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
                    rating=4.7
                ),
                Product(
                    name="No. 5 Parfum",
                    brand="Chanel",
                    category="Women",
                    description="The very essence of femininity. An abstract, mysterious, powdered floral bouquet. The ultimate expression of the perfumer's art.",
                    notes="Aldehydes, Ylang-Ylang, Neroli, Bergamot, Lemon, Iris, Jasmine, Rose, Orris Root, Amber, Sandalwood, Patchouli, Musk, Vanilla, Oakmoss",
                    price=210.0,
                    stock=12,
                    image_url="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
                    rating=4.9
                ),
                Product(
                    name="Sauvage Elixir",
                    brand="Dior",
                    category="Men",
                    description="Sauvage Elixir is an extraordinarily concentrated fragrance steeped in the iconic freshness of Sauvage with an intoxicating heart of Spices, a 'tailor-made' Lavender essence and a blend of rich Woods.",
                    notes="Cinnamon, Nutmeg, Cardamom, Grapefruit, Lavender, Licorice, Sandalwood, Amber, Patchouli, Vetiver",
                    price=230.0,
                    stock=8,
                    image_url="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600",
                    rating=4.8
                ),
                Product(
                    name="Santal 33",
                    brand="Le Labo",
                    category="Luxury Collection",
                    description="A perfume that touches the sensual universality of this icon, which would intoxicate a man as much as a woman. An open fire, the soft drift of smoke, where sensuality rises after the light has gone.",
                    notes="Sandalwood, Leather, Papyrus, Virginia Cedar, Violet, Cardamom, Iris, Amber",
                    price=310.0,
                    stock=3, # Low stock to trigger warnings!
                    image_url="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=600",
                    rating=4.6
                ),
                Product(
                    name="Black Opium",
                    brand="YSL",
                    category="Women",
                    description="A highly addictive feminine fragrance from Yves Saint Laurent. Fascinating and seductively intoxicating, the opening notes of adrenaline-rich coffee and the sweet sensuality of vanilla recline into the softness of white flowers.",
                    notes="Pear, Pink Pepper, Orange Blossom, Coffee, Jasmine, Bitter Almond, Licorice, Vanilla, Patchouli, Cedar, Cashmere Wood",
                    price=155.0,
                    stock=18,
                    image_url="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600",
                    rating=4.5
                ),
                Product(
                    name="Acqua Di Gio",
                    brand="Armani",
                    category="Men",
                    description="A classic marine-fresh fragrance that opens with a splash of fresh, calabrian bergamot, neroli and green tangerine. Light, aquatic nuances mix with rosemary, sweet persimmon and warm Indonesian patchouli.",
                    notes="Marine Notes, Bergamot, Jasmine, Cedarwood, Rosemary, Patchouli, Tangerine",
                    price=115.0,
                    stock=30,
                    image_url="https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600",
                    rating=4.6
                ),
                Product(
                    name="Oud Wood",
                    brand="Tom Ford",
                    category="Luxury Collection",
                    description="One of the most rare, precious, and expensive ingredients in a perfumer's arsenal, oud wood is often burned in incense-filled temples. Exotic rosewood and cardamom give way to a smoky blend of rare oud wood, sandalwood, and vetiver.",
                    notes="Oud Wood, Sandalwood, Chinese Sichuan Pepper, Rosewood, Cardamom, Vanilla, Tonka Bean, Vetiver, Amber",
                    price=295.0,
                    stock=10,
                    image_url="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600",
                    rating=4.9
                )
            ]
            for p in products_seed:
                db.add(p)
            db.commit()

            # Seed a few customer reviews
            prods = db.query(Product).all()
            sonia_user = db.query(User).filter(User.email == "sonia@luxeaura.com").first()
            if sonia_user:
                for p in prods:
                    rev = Review(
                        user_id=sonia_user.id,
                        product_id=p.id,
                        rating=5 if p.name in ["Lost Cherry", "Oud Wood", "No. 5 Parfum"] else 4,
                        comment=f"Absolutely exquisite scent profile! The longevity and sillage of {p.brand}'s {p.name} are truly unmatched. Highly recommend for any connoisseur."
                    )
                    db.add(rev)
                db.commit()

        # Check if coupons are empty
        if db.query(Coupon).count() == 0:
            expiry = datetime.now() + timedelta(days=120)
            coupons_seed = [
                Coupon(code="WELCOME10", discount=0.10, expiry_date=expiry, is_active=True),
                Coupon(code="SUMMER20", discount=0.20, expiry_date=expiry, is_active=True),
                Coupon(code="FESTIVE30", discount=0.30, expiry_date=expiry, is_active=True)
            ]
            for c in coupons_seed:
                db.add(c)
            db.commit()

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
