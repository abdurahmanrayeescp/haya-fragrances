def test_perfume_creator_fallback_rain(client, db_session):
    # Call perfume-creator with rain inspiration
    response = client.post(
        "/api/ai/perfume-creator",
        json={"description": "Rainy evenings in Kerala with coffee and books."}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert data["perfume_name"] == "Monsoon Noir"
    assert "story" in data
    assert "slogan" in data
    assert "Bergamot" in data["top_notes"]
    assert "Coffee Accord" in data["middle_notes"]
    assert "Sandalwood" in data["base_notes"]
    assert "emerald green" in data["bottle_color"]
    assert data["luxury_score"] == 95
    assert "image_prompt" in data
    
    # Verify the image prompt contains the color and style
    prompt = data["image_prompt"]
    assert "emerald green" in prompt
    assert "heavyweight octagonal crystal flask" in prompt
    
    # Call generate-bottle with the generated prompt
    img_response = client.post(
        "/api/ai/generate-bottle",
        json={"image_prompt": prompt}
    )
    assert img_response.status_code == 200
    img_data = img_response.json()
    assert "image_url" in img_data
    # For green bottle, it should return the green Unsplash photo url
    assert "photo-1588405748373-122b2321bc31" in img_data["image_url"]

def test_perfume_creator_fallback_general(client, db_session):
    # Call with a general dream description
    response = client.post(
        "/api/ai/perfume-creator",
        json={"description": "A mysterious dream of floating in space."}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert data["perfume_name"] == "Aura Privée"
    assert data["luxury_score"] == 88
    assert "crystal clear glass" in data["image_prompt"]
    
    # Call generate-bottle with the custom prompt
    img_response = client.post(
        "/api/ai/generate-bottle",
        json={"image_prompt": data["image_prompt"]}
    )
    assert img_response.status_code == 200
    img_data = img_response.json()
    assert "photo-1541643600914-78b084683601" in img_data["image_url"]
