from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# =========================
# User Schemas
# =========================

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool


# =========================
# Product Schemas
# =========================

class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None
    price: float = Field(gt=0)
    file_url: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )
    description: str | None = None
    price: float | None = Field(
        default=None,
        gt=0,
    )
    file_url: str | None = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    price: float
    file_url: str | None
    is_active: bool


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    page: int
    limit: int
    total: int
    total_pages: int


# =========================
# Order Schemas
# =========================

class OrderCreate(BaseModel):
    product_id: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    created_at: datetime


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int | None
    amount: float
    status: str
    created_at: datetime


class OrderDetailResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    status: str
    created_at: datetime
    items: list[OrderItemResponse]


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    page: int
    limit: int
    total: int
    total_pages: int


# =========================
# Payment Schemas
# =========================

class CheckoutRequest(BaseModel):
    order_id: int = Field(gt=0)


class CheckoutResponse(BaseModel):
    checkout_url: str


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    amount: float
    status: str
    stripe_session_id: str | None
    stripe_payment_intent_id: str | None
    created_at: datetime
    updated_at: datetime


# =========================
# Cart Schemas
# =========================

class CartItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(default=1, gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total_amount: float