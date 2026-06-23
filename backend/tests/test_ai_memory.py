from app.models.product import Product

def test_memory_finder_fallback_rain_coffee(client, db_session):
    # Seed mock products
    p1 = Product(
        name="Lost Cherry",
        brand="Tom Ford",
        category="Unisex",
        description="Rich cherry and vanilla notes for a comforting feel",
        notes="Cherry, Vanilla, Amber",
        price=395.0,
        stock=10
    )
    p2 = Product(
        name="Acqua Di Gio",
        brand="Armani",
        category="Men",
        description="Fresh marine notes with citrus breeze",
        notes="Marine Notes, Bergamot, Rosemary",
        price=115.0,
        stock=15
    )
    db_session.add_all([p1, p2])
    db_session.commit()

    # Call endpoint with coffee and rain keywords
    response = client.post(
        "/api/ai/memory-finder",
        json={"memory": "I remember rainy coffee mornings with a good book"}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert "emotions" in data
    assert "notes" in data
    assert "description" in data
    assert "recommendations" in data
    
    # Check that at least some emotions and notes matching our keywords were returned
    assert any("comfort" in em or "cozy" in em for em in data["emotions"])
    assert any("coffee" in nt or "vanilla" in nt for nt in data["notes"])
    
    # Check recommendations format and count
    recs = data["recommendations"]
    assert len(recs) > 0
    assert recs[0]["name"] in ["Lost Cherry", "Acqua Di Gio"]
    assert "match_percentage" in recs[0]
    assert recs[0]["match_percentage"] >= 75
    assert recs[0]["match_percentage"] <= 98

def test_memory_finder_fallback_beach(client, db_session):
    # Seed mock products
    p1 = Product(
        name="Santal 33",
        brand="Le Labo",
        category="Luxury Collection",
        description="Sandalwood and cedarwood notes",
        notes="Sandalwood, Virginia Cedar, Leather",
        price=310.0,
        stock=3
    )
    p2 = Product(
        name="Acqua Di Gio",
        brand="Armani",
        category="Men",
        description="Fresh marine notes and salty sea breezes",
        notes="Marine Notes, Bergamot",
        price=115.0,
        stock=30
    )
    db_session.add_all([p1, p2])
    db_session.commit()

    # Call endpoint with beach keywords
    response = client.post(
        "/api/ai/memory-finder",
        json={"memory": "walking on a beach at sunset"}
    )
    assert response.status_code == 200
    data = response.json()
    
    # "sea salt" or "marine notes" should match
    assert any("marine" in nt or "sea" in nt or "citrus" in nt for nt in data["notes"])
    recs = data["recommendations"]
    # Acqua Di Gio should be the top match because of "marine notes" and "sea breezes" in description
    assert recs[0]["name"] == "Acqua Di Gio"
