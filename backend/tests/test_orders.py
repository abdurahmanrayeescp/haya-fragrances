from datetime import datetime, timedelta
from app.models.user import User
from app.models.product import Product
from app.models.coupon import Coupon
from app.security import get_password_hash

def test_order_creation_with_coupon(client, db_session):
    # 1. Seed user, product, and coupon
    hashed = get_password_hash("Password123!")
    user = User(name="Alex Smith", email="alex@luxeaura.com", hashed_password=hashed, role="user")
    product = Product(name="Oud Wood", brand="Tom Ford", category="Unisex", description="Woody spicy oud", price=200.0, stock=10)
    coupon = Coupon(code="FESTIVE30", discount=0.30, expiry_date=datetime.now() + timedelta(days=5), is_active=True)
    db_session.add_all([user, product, coupon])
    db_session.commit()

    # 2. Get login token
    login_resp = client.post("/api/auth/login", json={"email": "alex@luxeaura.com", "password": "Password123!"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create order with coupon
    # Total calculation:
    # Subtotal: 200.0 * 2 = 400.0
    # Coupon 30% discount: 400.0 * 0.3 = 120.0 (Remaining subtotal: 280.0)
    # Tax 8%: 400.0 * 0.08 = 32.0 (Note: Tax in router code is calculated on subtotal before discount: subtotal * 0.08 = 32.0)
    # Shipping: free since subtotal (400.0) >= 150.0
    # Final total: 400.0 - 120.0 + 32.0 + 0 = 312.0
    order_payload = {
        "items": [{"product_id": product.id, "quantity": 2}],
        "payment_method": "Card",
        "shipping_address": "123 Luxury Ave, Beverly Hills, CA",
        "phone_number": "555-123-4567",
        "coupon_code": "FESTIVE30"
    }

    order_resp = client.post("/api/orders", json=order_payload, headers=headers)
    assert order_resp.status_code == 201
    order_data = order_resp.json()
    assert order_data["total_price"] == 312.0
    assert order_data["status"] == "Pending"
    assert len(order_data["items"]) == 1
    assert order_data["items"][0]["quantity"] == 2

    # 4. Verify inventory decremented: stock was 10, now 8
    db_session.refresh(product)
    assert product.stock == 8

    # 5. Fetch order history
    history_resp = client.get("/api/orders/history", headers=headers)
    assert history_resp.status_code == 200
    assert len(history_resp.json()) == 1
    assert history_resp.json()[0]["id"] == order_data["id"]
