import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Logging – must be configured before anything else so startup errors surface
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("luxeaura")

# ---------------------------------------------------------------------------
# Database bootstrap (import early so connection errors surface at startup)
# ---------------------------------------------------------------------------
try:
    from app.database import Base, engine, SessionLocal
    logger.info("Database engine created successfully.")
except Exception as exc:
    logger.critical("FATAL: Could not create database engine: %s", exc)
    raise

# ---------------------------------------------------------------------------
# Model imports – required so SQLAlchemy registers every table before
# create_all() is called.  Missing imports = missing tables at runtime.
# ---------------------------------------------------------------------------
try:
    from app.models.user import User          # noqa: F401
    from app.models.product import Product    # noqa: F401
    from app.models.coupon import Coupon      # noqa: F401
    from app.models.review import Review      # noqa: F401
    from app.models.order import Order        # noqa: F401  (also imports OrderItem)
    from app.models.wishlist import Wishlist  # noqa: F401
    logger.info("All models imported successfully.")
except ImportError as exc:
    logger.critical("FATAL: Model import error: %s", exc)
    raise

# ---------------------------------------------------------------------------
# Router imports
# ---------------------------------------------------------------------------
try:
    from app.routers import auth, users, products, orders, wishlist, reviews, admin, ai_recommend
    logger.info("All routers imported successfully.")
except ImportError as exc:
    logger.critical("FATAL: Router import error: %s", exc)
    raise

from app.security import get_password_hash
from datetime import datetime, timedelta, timezone


# ---------------------------------------------------------------------------
# Lifespan handler (replaces deprecated @app.on_event)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs on startup (before yield) and shutdown (after yield).
    - Creates all database tables.
    - Seeds initial data if the database is empty.
    """
    # --- Startup ---
    logger.info("Running startup tasks…")

    # Create tables (safe to call repeatedly – uses CREATE TABLE IF NOT EXISTS)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified / created.")
    except Exception as exc:
        logger.critical("FATAL: create_all failed: %s", exc)
        raise

    # Seed default data
    _seed_database()

    logger.info("Startup complete. LuxeAura API is ready.")

    yield  # Application runs here

    # --- Shutdown ---
    logger.info("Shutdown complete.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="LuxeAura API",
    description="Premium Luxury Perfume E-Commerce Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS middleware – must be added before any routers
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://haya-fragrances.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# Each router module already defines its own sub-prefix (e.g. prefix="/auth").
# We only add the shared "/api" parent prefix here, plus explicit tags so the
# Swagger UI groups them correctly.
# ---------------------------------------------------------------------------
app.include_router(auth.router,         prefix="/api/auth",     tags=["Auth"])
app.include_router(users.router,        prefix="/api/users",    tags=["Users"])
app.include_router(products.router,     prefix="/api/products", tags=["Products"])
app.include_router(orders.router,       prefix="/api/orders",   tags=["Orders"])
app.include_router(wishlist.router,     prefix="/api/wishlist", tags=["Wishlist"])
app.include_router(reviews.router,      prefix="/api/reviews",  tags=["Reviews"])
app.include_router(admin.router,        prefix="/api/admin",    tags=["Admin"])
app.include_router(ai_recommend.router, prefix="/api/ai",       tags=["AI"])


# ---------------------------------------------------------------------------
# Health-check root endpoint
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def read_root():
    return {
        "name": "LuxeAura API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Railway / Vercel can ping this to verify the app is alive."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Seed helper (called from lifespan)
# ---------------------------------------------------------------------------
def _seed_database():
    db = SessionLocal()
    try:
        # ---- Users ----
        if db.query(User).count() == 0:
            logger.info("Seeding default users…")
            admin_user = User(
                name="Luxe Admin",
                email="admin@luxeaura.com",
                hashed_password=get_password_hash("Admin123!"),
                role="admin",
            )
            customer_user = User(
                name="Sonia Laurent",
                email="sonia@luxeaura.com",
                hashed_password=get_password_hash("Customer123!"),
                role="user",
            )
            db.add(admin_user)
            db.add(customer_user)
            db.commit()
            logger.info("Default users seeded.")

        # ---- Haya Admin account (idempotent – only inserted if missing) ----
        if not db.query(User).filter(User.email == "admin@haya.com").first():
            logger.info("Seeding Haya admin account…")
            haya_admin = User(
                name="Haya Admin",
                email="admin@haya.com",
                hashed_password=get_password_hash("Admin123"),
                role="admin",
            )
            db.add(haya_admin)
            db.commit()
            logger.info("Haya admin (admin@haya.com) seeded successfully.")

        # ---- Products ----
        logger.info("Verifying and seeding product catalog…")
        products_seed = [
            Product(
                name="Lost Cherry",
                brand="Tom Ford",
                category="Unisex",
                description=(
                    "Lost Cherry is a full-bodied journey into the once-forbidden; "
                    "a contrasting scent that reveals a tempting dichotomy of playful, "
                    "candy-like gleam on the outside and luscious flesh on the inside."
                ),
                notes="Black Cherry, Bitter Almond, Griotte Syrup, Turkish Rose, Jasmine Sambac, Roasted Tonka, Sandalwood, Vetiver, Cedar",
                price=395.0,
                stock=15,
                image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
                rating=4.8,
            ),
            Product(
                name="Bleu de Chanel",
                brand="Chanel",
                category="Men",
                description=(
                    "An ode to masculine freedom expressed in a woody aromatic fragrance "
                    "with a captivating trail. A timeless scent housed in a bottle of deep "
                    "and mysterious blue."
                ),
                notes="Grapefruit, Lemon, Mint, Pink Pepper, Ginger, Nutmeg, Jasmine, Incense, Vetiver, Cedar, Sandalwood, Patchouli, Labdanum",
                price=150.0,
                stock=25,
                image_url="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
                rating=4.7,
            ),
            Product(
                name="No. 5 Parfum",
                brand="Chanel",
                category="Women",
                description=(
                    "The very essence of femininity. An abstract, mysterious, powdered floral "
                    "bouquet. The ultimate expression of the perfumer's art."
                ),
                notes="Aldehydes, Ylang-Ylang, Neroli, Bergamot, Lemon, Iris, Jasmine, Rose, Orris Root, Amber, Sandalwood, Patchouli, Musk, Vanilla, Oakmoss",
                price=210.0,
                stock=12,
                image_url="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
                rating=4.9,
            ),
            Product(
                name="Sauvage Elixir",
                brand="Dior",
                category="Men",
                description=(
                    "Sauvage Elixir is an extraordinarily concentrated fragrance steeped in "
                    "the iconic freshness of Sauvage with an intoxicating heart of Spices, a "
                    "'tailor-made' Lavender essence and a blend of rich Woods."
                ),
                notes="Cinnamon, Nutmeg, Cardamom, Grapefruit, Lavender, Licorice, Sandalwood, Amber, Patchouli, Vetiver",
                price=230.0,
                stock=8,
                image_url="https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600",
                rating=4.8,
            ),
            Product(
                name="Santal 33",
                brand="Le Labo",
                category="Luxury Collection",
                description=(
                    "A perfume that touches the sensual universality of this icon, which would "
                    "intoxicate a man as much as a woman. An open fire, the soft drift of smoke, "
                    "where sensuality rises after the light has gone."
                ),
                notes="Sandalwood, Leather, Papyrus, Virginia Cedar, Violet, Cardamom, Iris, Amber",
                price=310.0,
                stock=3,
                image_url="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=600",
                rating=4.6,
            ),
            Product(
                name="Black Opium",
                brand="YSL",
                category="Women",
                description=(
                    "A highly addictive feminine fragrance from Yves Saint Laurent. Fascinating "
                    "and seductively intoxicating, the opening notes of adrenaline-rich coffee "
                    "and the sweet sensuality of vanilla recline into the softness of white flowers."
                ),
                notes="Pear, Pink Pepper, Orange Blossom, Coffee, Jasmine, Bitter Almond, Licorice, Vanilla, Patchouli, Cedar, Cashmere Wood",
                price=155.0,
                stock=18,
                image_url="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600",
                rating=4.5,
            ),
            Product(
                name="Acqua Di Gio",
                brand="Armani",
                category="Men",
                description=(
                    "A classic marine-fresh fragrance that opens with a splash of fresh, calabrian "
                    "bergamot, neroli and green tangerine. Light, aquatic nuances mix with rosemary, "
                    "sweet persimmon and warm Indonesian patchouli."
                ),
                notes="Marine Notes, Bergamot, Jasmine, Cedarwood, Rosemary, Patchouli, Tangerine",
                price=115.0,
                stock=30,
                image_url="https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600",
                rating=4.6,
            ),
            Product(
                name="Oud Wood",
                brand="Tom Ford",
                category="Luxury Collection",
                description=(
                    "One of the most rare, precious, and expensive ingredients in a perfumer's "
                    "arsenal, oud wood is often burned in incense-filled temples. Exotic rosewood "
                    "and cardamom give way to a smoky blend of rare oud wood, sandalwood, and vetiver."
                ),
                notes="Oud Wood, Sandalwood, Chinese Sichuan Pepper, Rosewood, Cardamom, Vanilla, Tonka Bean, Vetiver, Amber",
                price=295.0,
                stock=10,
                image_url="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600",
                rating=4.9,
            ),
            Product(
                name="Midnight Oud",
                brand="Amouage",
                category="Luxury Collection",
                description=(
                    "An opulent, rich fragrance evoking the absolute luxury of Dubai. Saffron, "
                    "leather, and precious oud wood blend with warm amber and smoky incense."
                ),
                notes="Oud Wood, Saffron, Amber, Leather, Incense, Patchouli, Sandalwood",
                price=340.0,
                stock=10,
                image_url="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600",
                rating=4.9,
            ),
            Product(
                name="Royal Amber",
                brand="Xerjoff",
                category="Luxury Collection",
                description=(
                    "Reminiscent of walking on a beach at sunset, Royal Amber carries a warm, glowing "
                    "heart of golden amber, vanilla, orange blossom, and bergamot."
                ),
                notes="Amber, Vanilla, Bergamot, Orange Blossom, Labdanum, Patchouli",
                price=320.0,
                stock=12,
                image_url="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
                rating=4.8,
            ),
            Product(
                name="Velvet Musk",
                brand="Narciso Rodriguez",
                category="Women",
                description=(
                    "Elegant and timeless, evoking a romantic wedding day. Fresh white musk, "
                    "delicate rose, and sweet jasmine petals rest on a bed of warm amber and cedarwood."
                ),
                notes="White Musk, Rose, Jasmine, Ylang-Ylang, Cedarwood, Amber",
                price=145.0,
                stock=15,
                image_url="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
                rating=4.7,
            ),
            Product(
                name="Café Noir",
                brand="Maison Margiela",
                category="Unisex",
                description=(
                    "Cozy and rich, bringing to mind rainy evenings spent indoors with a cup of "
                    "coffee and a good book. Warm vanilla, roasted coffee beans, and tonka blend "
                    "with rich cocoa and cedarwood."
                ),
                notes="Coffee, Vanilla, Tonka Bean, Cocoa, Sandalwood, Patchouli, Cedarwood",
                price=160.0,
                stock=18,
                image_url="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600",
                rating=4.8,
            ),
            Product(
                name="Dawn Serenity",
                brand="Haya Fragrances",
                category="Luxury Collection",
                description=(
                    "Inspired by the serene atmosphere of a peaceful mosque after Fajr prayer. "
                    "Pure white musk, grounding sandalwood, and a soft touch of rosewater."
                ),
                notes="White Musk, Sandalwood, Amber, Rosewater, Oud Wood",
                price=180.0,
                stock=10,
                image_url="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=600",
                rating=4.9,
            ),
        ]

        seeded_count = 0
        for p in products_seed:
            existing = db.query(Product).filter(Product.name == p.name).first()
            if not existing:
                db.add(p)
                seeded_count += 1
        if seeded_count > 0:
            db.commit()
            logger.info(f"Seeded {seeded_count} new products.")

            # Seed reviews for newly added products
            sonia_user = db.query(User).filter(User.email == "sonia@luxeaura.com").first()
            if sonia_user:
                for p in db.query(Product).all():
                    existing_rev = db.query(Review).filter(Review.user_id == sonia_user.id, Review.product_id == p.id).first()
                    if not existing_rev:
                        rev = Review(
                            user_id=sonia_user.id,
                            product_id=p.id,
                            rating=5 if p.name in ["Lost Cherry", "Oud Wood", "No. 5 Parfum", "Midnight Oud", "Dawn Serenity"] else 4,
                            comment=(
                                f"Absolutely exquisite scent profile! The longevity and sillage of "
                                f"{p.brand}'s {p.name} are truly unmatched. Highly recommend for any connoisseur."
                            ),
                        )
                        db.add(rev)
                db.commit()
            logger.info("Products database verification and reviews seeding complete.")

        # ---- Coupons ----
        if db.query(Coupon).count() == 0:
            logger.info("Seeding default coupons…")
            expiry = datetime.now(timezone.utc) + timedelta(days=120)
            coupons_seed = [
                Coupon(code="WELCOME10", discount=0.10, expiry_date=expiry, is_active=True),
                Coupon(code="SUMMER20",  discount=0.20, expiry_date=expiry, is_active=True),
                Coupon(code="FESTIVE30", discount=0.30, expiry_date=expiry, is_active=True),
            ]
            for c in coupons_seed:
                db.add(c)
            db.commit()
            logger.info("Default coupons seeded.")

    except Exception as exc:
        db.rollback()
        logger.error("Error during database seed: %s", exc)
        # Non-fatal: app still starts even if seed fails
    finally:
        db.close()
