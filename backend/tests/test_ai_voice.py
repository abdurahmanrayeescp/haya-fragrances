from app.models.product import Product

def test_voice_analysis_meeting(client, db_session):
    # Seed mock products
    p1 = Product(
        name="Lost Cherry",
        brand="Tom Ford",
        category="Unisex",
        description="Vanilla and amber sillage",
        notes="Cherry, Vanilla, Amber",
        price=395.0,
        stock=10
    )
    p2 = Product(
        name="Bleu de Chanel",
        brand="Chanel",
        category="Men",
        description="Fresh citrus with cedarwood and vetiver sillage",
        notes="Grapefruit, Lemon, Cedar, Vetiver",
        price=150.0,
        stock=25
    )
    db_session.add_all([p1, p2])
    db_session.commit()

    # Call endpoint with meeting/business transcript
    response = client.post(
        "/api/ai/voice-analysis",
        json={"transcript": "I need a powerful scent for an important business meeting."}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert "transcript" in data
    assert "moods" in data
    assert "energy" in data
    assert "confidence_score" in data
    assert "occasion" in data
    assert "notes" in data
    assert "description" in data
    assert "recommendations" in data

    # Check mood and occasion returned by fallback matching
    assert "confident" in data["moods"] or "focused" in data["moods"]
    assert data["occasion"] == "Office"
    assert data["energy"] == "high"
    assert data["confidence_score"] == 92
    
    # Check that cedarwood/vetiver notes are suggested
    assert any("cedarwood" in nt or "vetiver" in nt or "sandalwood" in nt for nt in data["notes"])
    
    # Verify recommendations
    recs = data["recommendations"]
    assert len(recs) > 0
    # Bleu de Chanel should match best due to cedar/vetiver matching and Men category
    assert recs[0]["name"] == "Bleu de Chanel"
    assert recs[0]["match_percentage"] >= 75

def test_voice_analysis_date_night(client, db_session):
    # Seed mock products
    p1 = Product(
        name="Lost Cherry",
        brand="Tom Ford",
        category="Unisex",
        description="Warm vanilla and amber accords",
        notes="Cherry, Vanilla, Amber",
        price=395.0,
        stock=10
    )
    p2 = Product(
        name="Acqua Di Gio",
        brand="Armani",
        category="Men",
        description="Fresh marine breeze",
        notes="Marine Notes, Bergamot",
        price=115.0,
        stock=30
    )
    db_session.add_all([p1, p2])
    db_session.commit()

    response = client.post(
        "/api/ai/voice-analysis",
        json={"transcript": "I want something romantic for a dinner date night."}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert "romantic" in data["moods"] or "intimate" in data["moods"]
    assert data["occasion"] == "Date Night"
    
    # Lost Cherry should match best due to vanilla/amber and Date Night occasion matching
    recs = data["recommendations"]
    assert recs[0]["name"] == "Lost Cherry"
