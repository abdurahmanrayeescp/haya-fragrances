def test_register_and_login(client):
    # 1. Register a new user
    reg_response = client.post(
        "/api/auth/register",
        json={
            "name": "Marie Curie",
            "email": "marie@luxeaura.com",
            "password": "Password123!"
        }
    )
    assert reg_response.status_code == 201
    assert reg_response.json()["name"] == "Marie Curie"
    assert reg_response.json()["email"] == "marie@luxeaura.com"

    # 2. Register again with same email (should fail)
    fail_reg = client.post(
        "/api/auth/register",
        json={
            "name": "Marie Curie Dupe",
            "email": "marie@luxeaura.com",
            "password": "Password123!"
        }
    )
    assert fail_reg.status_code == 400

    # 3. Login
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "marie@luxeaura.com",
            "password": "Password123!"
        }
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["user"]["email"] == "marie@luxeaura.com"

    # 4. Get Profile with valid JWT
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    profile_response = client.get("/api/auth/profile", headers=headers)
    assert profile_response.status_code == 200
    assert profile_response.json()["name"] == "Marie Curie"

    # 5. Get Profile with invalid JWT (should fail)
    profile_response_fail = client.get("/api/auth/profile", headers={"Authorization": "Bearer badtoken"})
    assert profile_response_fail.status_code == 401
