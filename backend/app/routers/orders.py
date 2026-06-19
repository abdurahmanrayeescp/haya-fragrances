from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.coupon import Coupon
from app.schemas.order_schema import OrderCreate, OrderResponse, OrderStatusUpdate
from app.dependencies import get_current_user, get_admin_user
from app.services.email_service import EmailService

router = APIRouter(tags=["Orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )
        
    subtotal = 0.0
    items_to_create = []

    # 1. Validate stock and compute subtotal
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found"
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}. Requested: {item.quantity}, Available: {product.stock}"
            )
        
        item_price = product.price
        subtotal += item_price * item.quantity
        
        # Decrement stock
        product.stock -= item.quantity
        
        order_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=item_price
        )
        items_to_create.append(order_item)

    # 2. Apply Coupon if applicable
    discount_percentage = 0.0
    if payload.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == payload.coupon_code.upper().strip(),
            Coupon.is_active == True
        ).first()
        
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired coupon code"
            )
        if coupon.expiry_date.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon code has expired"
            )
        
        discount_percentage = coupon.discount

    # 3. Calculate final total (adding mock tax of 8% and $15 shipping, if total > $150 shipping is free)
    tax = subtotal * 0.08
    shipping = 15.0 if subtotal < 150.0 else 0.0
    
    discount_amount = subtotal * discount_percentage
    final_total = subtotal - discount_amount + tax + shipping

    # 4. Create Order
    new_order = Order(
        user_id=current_user.id,
        total_price=round(final_total, 2),
        payment_method=payload.payment_method,
        shipping_address=payload.shipping_address,
        phone_number=payload.phone_number,
        status="Pending"
    )
    
    db.add(new_order)
    db.commit() # Save order to get ID
    
    # Associate items
    for item in items_to_create:
        item.order_id = new_order.id
        db.add(item)
        
    db.commit()
    db.refresh(new_order)

    # Send order confirmation email
    EmailService.send_order_confirmation(current_user.email, new_order.id, new_order.total_price)

    return new_order

@router.get("/history", response_model=List[OrderResponse])
def get_order_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/all", response_model=List[OrderResponse])
def get_all_orders(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
