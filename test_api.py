import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.models import User


# ============================================================
# Test Database
# ============================================================

TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================================
# Database Dependency Override
# ============================================================

def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# ============================================================
# Fixtures
# ============================================================

@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as test_client:
        yield test_client

    Base.metadata.drop_all(bind=engine)


# ============================================================
# Helper Functions
# ============================================================

def register_user(
    client,
    name="Test User",
    email="test@example.com",
    password="Test@123",
):
    response = client.post(
        "/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
        },
    )

    return response


def login_user(
    client,
    email="test@example.com",
    password="Test@123",
):
    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    return response


def get_auth_headers(client, email, password):
    response = login_user(
        client,
        email=email,
        password=password,
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


def create_admin_user(client):
    register_response = register_user(
        client,
        name="Admin User",
        email="admin@example.com",
        password="Admin@123",
    )

    assert register_response.status_code == 201

    db = TestingSessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == "admin@example.com")
            .first()
        )

        assert user is not None

        user.role = "admin"
        db.commit()

    finally:
        db.close()

    return get_auth_headers(
        client,
        "admin@example.com",
        "Admin@123",
    )


def create_product(client, admin_headers):
    response = client.post(
        "/products/",
        headers=admin_headers,
        json={
            "name": "Python Programming Course",
            "description": "Complete Python programming course",
            "price": 499,
            "file_url": "https://example.com/python-course.pdf",
        },
    )

    assert response.status_code == 201

    return response.json()


# ============================================================
# TEST 1
# User Registration
# ============================================================

def test_user_registration(client):
    response = register_user(
        client,
        name="Lavanya Test",
        email="lavanya@example.com",
        password="Test@123",
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "lavanya@example.com"
    assert data["name"] == "Lavanya Test"


# ============================================================
# TEST 2
# Duplicate Email Registration
# ============================================================

def test_duplicate_email_registration(client):
    first_response = register_user(
        client,
        name="First User",
        email="duplicate@example.com",
        password="Test@123",
    )

    assert first_response.status_code == 201

    second_response = register_user(
        client,
        name="Second User",
        email="duplicate@example.com",
        password="Test@456",
    )

    assert second_response.status_code == 400

    assert (
        second_response.json()["detail"]
        == "Email already registered"
    )


# ============================================================
# TEST 3
# Invalid Login
# ============================================================

def test_invalid_login(client):
    register_response = register_user(
        client,
        name="Login Test",
        email="login@example.com",
        password="Correct@123",
    )

    assert register_response.status_code == 201

    response = login_user(
        client,
        email="login@example.com",
        password="WrongPassword",
    )

    assert response.status_code == 401

    assert (
        response.json()["detail"]
        == "Invalid email or password"
    )


# ============================================================
# TEST 4
# Get Current User Profile
# ============================================================

def test_get_current_user_profile(client):
    register_response = register_user(
        client,
        name="Profile User",
        email="profile@example.com",
        password="Profile@123",
    )

    assert register_response.status_code == 201

    headers = get_auth_headers(
        client,
        "profile@example.com",
        "Profile@123",
    )

    response = client.get(
        "/auth/me",
        headers=headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "profile@example.com"
    assert data["name"] == "Profile User"


# ============================================================
# TEST 5
# Public Product Listing
# ============================================================

def test_get_products_public(client):
    admin_headers = create_admin_user(client)

    create_product(
        client,
        admin_headers,
    )

    response = client.get("/products/")

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data
    assert "total_pages" in data

    assert data["total"] >= 1
    assert len(data["items"]) >= 1


# ============================================================
# TEST 6
# Admin Can Create Product
# ============================================================

def test_admin_can_create_product(client):
    admin_headers = create_admin_user(client)

    response = client.post(
        "/products/",
        headers=admin_headers,
        json={
            "name": "Advanced FastAPI Course",
            "description": "Learn advanced FastAPI backend development",
            "price": 1499,
            "file_url": "https://example.com/fastapi-course.pdf",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Advanced FastAPI Course"
    assert data["price"] == 1499


# ============================================================
# TEST 7
# Normal User Cannot Create Product
# ============================================================

def test_normal_user_cannot_create_product(client):
    register_response = register_user(
        client,
        name="Normal User",
        email="normal@example.com",
        password="Normal@123",
    )

    assert register_response.status_code == 201

    headers = get_auth_headers(
        client,
        "normal@example.com",
        "Normal@123",
    )

    response = client.post(
        "/products/",
        headers=headers,
        json={
            "name": "Unauthorized Product",
            "description": "This should not be created",
            "price": 999,
            "file_url": "https://example.com/file.pdf",
        },
    )

    assert response.status_code == 403


# ============================================================
# TEST 8
# Create Order from Product
# ============================================================

def test_create_order_from_product(client):
    admin_headers = create_admin_user(client)

    product = create_product(
        client,
        admin_headers,
    )

    register_response = register_user(
        client,
        name="Customer User",
        email="customer@example.com",
        password="Customer@123",
    )

    assert register_response.status_code == 201

    customer_headers = get_auth_headers(
        client,
        "customer@example.com",
        "Customer@123",
    )

    response = client.post(
        "/orders/",
        headers=customer_headers,
        json={
            "product_id": product["id"],
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["user_id"] is not None
    assert data["product_id"] == product["id"]
    assert data["amount"] == 499
    assert data["status"] == "pending"


# ============================================================
# TEST 9
# Empty Cart Checkout Should Fail
# ============================================================

def test_empty_cart_checkout_fails(client):
    register_response = register_user(
        client,
        name="Cart User",
        email="cart@example.com",
        password="Cart@123",
    )

    assert register_response.status_code == 201

    headers = get_auth_headers(
        client,
        "cart@example.com",
        "Cart@123",
    )

    response = client.post(
        "/orders/from-cart",
        headers=headers,
    )

    assert response.status_code == 400

    assert response.json()["detail"] == "Cart is empty"