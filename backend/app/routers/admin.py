from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.coupon import Coupon
from app.schemas.coupon_schema import CouponCreate, CouponResponse
from app.schemas.auth_schema import LoginRequest, TokenResponse
from app.schemas.user_schema import UserResponse
from app.security import verify_password, create_access_token
from app.dependencies import get_admin_user
from app.config import settings

router = APIRouter(tags=["Admin"])


# ---------------------------------------------------------------------------
# Image upload  (Cloudinary)
# ---------------------------------------------------------------------------

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
):
    """
    Accepts a multipart image file, uploads it to Cloudinary, and returns
    the public CDN URL.  Requires three Railway environment variables:
      CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET
    """
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF, AVIF.",
        )

    # Read file contents and enforce size limit
    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large. Maximum allowed size is 5 MB.",
        )

    # Check Cloudinary is configured
    if not settings.CLOUDINARY_CLOUD_NAME or settings.CLOUDINARY_API_KEY == "cloud_mock_key":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Image hosting is not configured. "
                "Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_SECRET "
                "to your Railway environment variables, then redeploy."
            ),
        )

    # Upload to Cloudinary
    try:
        import cloudinary
        import cloudinary.uploader

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_SECRET,
            secure=True,
        )

        result = cloudinary.uploader.upload(
            contents,
            folder="haya-fragrances/products",
            resource_type="image",
            # Automatically resize very large images to stay under CDN limits
            transformation=[{"quality": "auto", "fetch_format": "auto"}],
        )
        return {"url": result["secure_url"]}

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(exc)}",
        )


# ---------------------------------------------------------------------------
# Admin-specific authentication
# ---------------------------------------------------------------------------

@router.post("/login", response_model=TokenResponse)
def admin_login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Dedicated admin login. Verifies credentials AND that the account has
    role == 'admin' before issuing a JWT token.
    Returns HTTP 403 if the user exists but is not an admin.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to administrator accounts",
        )
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}


# ---------------------------------------------------------------------------
# Admin user management
# ---------------------------------------------------------------------------

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Returns all registered users ordered by creation date (newest first)."""
    return db.query(User).order_by(User.created_at.desc()).all()


# ---------------------------------------------------------------------------
# Dashboard stats
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_dashboard_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Returns high-level statistics cards and trends for the Admin Dashboard.
    """
    # 1. Summaries
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    
    # Sum of non-cancelled order prices
    revenue_query = db.query(func.sum(Order.total_price)).filter(Order.status != "Cancelled").scalar()
    total_revenue = float(revenue_query) if revenue_query else 0.0

    # 2. Low stock alerts (stock < 5)
    low_stock = db.query(Product).filter(Product.stock < 5).all()
    low_stock_list = [
        {
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "stock": p.stock,
            "price": p.price
        } for p in low_stock
    ]

    # 3. Monthly sales trends (past 6 months)
    # Simple Python-based grouping for SQLite and PostgreSQL portability
    orders = db.query(Order).filter(Order.status != "Cancelled").all()
    monthly_sales: Dict[str, float] = {}
    monthly_orders: Dict[str, int] = {}
    
    for order in orders:
        month_str = order.created_at.strftime("%B") # e.g. "June"
        monthly_sales[month_str] = monthly_sales.get(month_str, 0.0) + order.total_price
        monthly_orders[month_str] = monthly_orders.get(month_str, 0) + 1

    trends_data = []
    # Order of months for visualization sequence
    all_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    current_month_index = datetime.now().month
    past_six = all_months[max(0, current_month_index-6):current_month_index]
    
    # Default months if trends are empty
    if not past_six:
        past_six = ["May", "June"]

    for m in past_six:
        trends_data.append({
            "month": m,
            "revenue": round(monthly_sales.get(m, 0.0), 2),
            "orders": monthly_orders.get(m, 0)
        })

    # 4. Top Brands Distribution
    brands_data = db.query(Product.brand, func.count(Product.id)).group_by(Product.brand).all()
    brands_dist = [{"brand": b[0], "count": b[1]} for b in brands_data]

    # 5. Recent Orders
    recent = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = [
        {
            "id": o.id,
            "customer": o.user.name if o.user else "Anonymous",
            "total_price": o.total_price,
            "status": o.status,
            "created_at": o.created_at
        } for o in recent
    ]

    return {
        "summary": {
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "total_users": total_users,
            "total_products": total_products
        },
        "low_stock": low_stock_list,
        "trends": trends_data,
        "brands": brands_dist,
        "recent_orders": recent_orders
    }

# --- Coupon Management endpoints ---

@router.get("/coupons", response_model=List[CouponResponse])
def get_all_coupons(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return db.query(Coupon).all()

@router.post("/coupons", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    payload: CouponCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Coupon).filter(Coupon.code == payload.code.upper().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon code already exists"
        )
        
    new_coupon = Coupon(
        code=payload.code.upper().strip(),
        discount=payload.discount,
        expiry_date=payload.expiry_date,
        is_active=payload.is_active
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

@router.delete("/coupons/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coupon(
    coupon_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    db.delete(coupon)
    db.commit()
    return None
