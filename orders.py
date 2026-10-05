
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Cart, CartItem, Order, OrderItem, Product, User
from ..schemas import (
    CheckoutRequest,
    CheckoutResponse,
    OrderCreate,
    OrderDetailResponse,
    OrderListResponse,
    OrderResponse,
)
from ..services.auth_service import get_current_user
from ..stripe_config import stripe


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


# =========================
# Create Order from Product
# =========================

@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(
        Product.id == order_data.product_id,
        Product.is_active == True,
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or inactive",
        )

    order = Order(
        user_id=current_user.id,
        product_id=product.id,
        amount=product.price,
        status="pending",
    )

    db.add(order)
    db.flush()

    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        quantity=1,
        unit_price=product.price,
        subtotal=product.price,
    )

    db.add(order_item)

    db.commit()
    db.refresh(order)

    return order


# =========================
# Create Order from Cart
# =========================

@router.post(
    "/from-cart",
    response_model=OrderDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order_from_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = db.query(Cart).filter(
        Cart.user_id == current_user.id
    ).first()

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    cart_items = db.query(CartItem).filter(
        CartItem.cart_id == cart.id
    ).all()

    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    total_amount = 0.0
    order_items_data = []

    for cart_item in cart_items:

        product = db.query(Product).filter(
            Product.id == cart_item.product_id,
            Product.is_active == True,
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Product with ID {cart_item.product_id} "
                    "is unavailable"
                ),
            )

        if cart_item.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid cart quantity",
            )

        subtotal = product.price * cart_item.quantity

        total_amount += subtotal

        order_items_data.append(
            {
                "product_id": product.id,
                "quantity": cart_item.quantity,
                "unit_price": product.price,
                "subtotal": subtotal,
            }
        )

    order = Order(
        user_id=current_user.id,
        product_id=None,
        amount=round(total_amount, 2),
        status="pending",
    )

    db.add(order)
    db.flush()

    for item_data in order_items_data:

        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )

        db.add(order_item)

    # Clear cart after creating order
    db.query(CartItem).filter(
        CartItem.cart_id == cart.id
    ).delete(
        synchronize_session=False
    )

    db.commit()
    db.refresh(order)

    order_items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    return OrderDetailResponse(
        id=order.id,
        user_id=order.user_id,
        amount=order.amount,
        status=order.status,
        created_at=order.created_at,
        items=order_items,
    )


# =========================
# Get My Orders - Pagination
# Required:
# GET /orders/?page=1&limit=5
# =========================

@router.get(
    "/",
    response_model=OrderListResponse,
)
def get_my_orders(
    page: int = Query(
        default=1,
        ge=1,
    ),
    limit: int = Query(
        default=5,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order).filter(
        Order.user_id == current_user.id
    )

    total = query.count()

    total_pages = ceil(total / limit) if total > 0 else 0

    offset = (page - 1) * limit

    orders = query.order_by(
        Order.created_at.desc()
    ).offset(
        offset
    ).limit(
        limit
    ).all()

    return OrderListResponse(
        items=orders,
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )


# =========================
# My Orders - Backward Compatible
# =========================

@router.get(
    "/my-orders",
    response_model=OrderListResponse,
)
def get_my_orders_legacy(
    page: int = Query(
        default=1,
        ge=1,
    ),
    limit: int = Query(
        default=5,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order).filter(
        Order.user_id == current_user.id
    )

    total = query.count()

    total_pages = ceil(total / limit) if total > 0 else 0

    offset = (page - 1) * limit

    orders = query.order_by(
        Order.created_at.desc()
    ).offset(
        offset
    ).limit(
        limit
    ).all()

    return OrderListResponse(
        items=orders,
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )


# =========================
# Get Individual Order
# =========================

@router.get(
    "/{order_id}",
    response_model=OrderDetailResponse,
)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id,
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order_items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    return OrderDetailResponse(
        id=order.id,
        user_id=order.user_id,
        amount=order.amount,
        status=order.status,
        created_at=order.created_at,
        items=order_items,
    )


# =========================
# Stripe Checkout
# =========================

@router.post(
    "/checkout",
    response_model=CheckoutResponse,
)
def create_checkout_session(
    checkout_data: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(
        Order.id == checkout_data.order_id,
        Order.user_id == current_user.id,
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.status.lower() != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be paid",
        )

    order_items = db.query(OrderItem).filter(
        OrderItem.order_id == order.id
    ).all()

    if not order_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order has no items",
        )

    line_items = []

    for order_item in order_items:

        product = db.query(Product).filter(
            Product.id == order_item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found",
            )

        line_items.append(
            {
                "price_data": {
                    "currency": "inr",
                    "product_data": {
                        "name": product.name,
                        "description": product.description or "",
                    },
                    "unit_amount": int(
                        order_item.unit_price * 100
                    ),
                },
                "quantity": order_item.quantity,
            }
        )

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=(
                "http://127.0.0.1:5500/"
                "payment-success.html"
            ),
            cancel_url=(
                "http://127.0.0.1:5500/"
                "payment-cancel.html"
            ),
            metadata={
                "order_id": str(order.id),
                "user_id": str(current_user.id),
            },
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to create Stripe checkout session: "
                f"{str(exc)}"
            ),
        )

    return {
        "checkout_url": checkout_session.url
    }
