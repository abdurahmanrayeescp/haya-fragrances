from app.models.user import User
from app.models.product import Product
from app.security import get_password_hash

def test_wishlist_and_ai_quiz(client, db_session):
    # 1. Seed user and products
    hashed = get_password_hash("Password123!")
    user = User(name="Charlie Brown", email="charlie@luxeaura.com", hashed_password=hashed, role="user")
    p1 = Product(name="Santal 33", brand="Le Labo", category="Unisex", description="Woody papyrus leather", notes="Sandalwood, Cardamom, Leather", price=310.0, stock=10)
    p2 = Product(name="Black Opium", brand="YSL", category="Women", description="Sweet floral coffee", notes="Coffee, Vanilla, Jasmine", price=155.0, stock=15)
    db_session.add_all([user, p1, p2])
    db_session.commit()

    # 2. Login
    login_resp = client.post("/api/auth/login", json={"email": "charlie@luxeaura.com", "password": "Password123!"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Add p1 to wishlist
    add_resp = client.post(f"/api/wishlist/{p1.id}", headers=headers)
    assert add_resp.status_code == 201
    assert add_resp.json()["message"] == "Product added to wishlist"

    # 4. Get wishlist
    get_resp = client.get("/api/wishlist", headers=headers)
    assert get_resp.status_code == 200
    assert len(get_resp.json()) == 1
    assert get_resp.json()[0]["name"] == "Santal 33"

    # 5. Delete from wishlist
    del_resp = client.delete(f"/api/wishlist/{p1.id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["message"] == "Product removed from wishlist"

    # 6. Test AI Recommendation Quiz
    quiz_payload = {
        "gender": "Women",
        "occasion": "Night Out",
        "preferred_notes": ["Vanilla", "Coffee"],
        "strength": "Moderate"
    }
    ai_resp = client.post("/api/ai/recommend", json=quiz_payload)
    assert ai_resp.status_code == 200
    recommendations = ai_resp.json()
    assert len(recommendations) >= 1
    # Black Opium should rank high because notes match Vanilla and Coffee
    assert recommendations[0]["name"] == "Black Opium"
