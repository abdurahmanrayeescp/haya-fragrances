from app.models.product import Product

def test_products_list_and_filters(client, db_session):
    # Seed mock products
    p1 = Product(name="Fabulous", brand="Tom Ford", category="Unisex", description="Incredible woody sillage", price=320.0, stock=10)
    p2 = Product(name="N5", brand="Chanel", category="Women", description="Floral aldehyde clean scent", price=180.0, stock=5)
    db_session.add_all([p1, p2])
    db_session.commit()

    # 1. Fetch all products (paginated)
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2

    # 2. Search query
    response_search = client.get("/api/products?search=Floral")
    assert response_search.status_code == 200
    assert response_search.json()["total"] == 1
    assert response_search.json()["items"][0]["name"] == "N5"

    # 3. Filter by category
    response_cat = client.get("/api/products?category=Unisex")
    assert response_cat.status_code == 200
    assert response_cat.json()["total"] == 1
    assert response_cat.json()["items"][0]["brand"] == "Tom Ford"

def test_product_detail_and_related(client, db_session):
    # Seed mock products
    p1 = Product(name="Fabulous", brand="Tom Ford", category="Unisex", description="Incredible woody sillage", price=320.0, stock=10)
    db_session.add(p1)
    db_session.commit()

    response = client.get(f"/api/products/{p1.id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["product"]["name"] == "Fabulous"
    assert "related" in detail
