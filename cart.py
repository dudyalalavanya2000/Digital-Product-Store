from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Cart, CartItem, Product, User
from ..schemas import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    CartResponse,
)
from ..services.auth_service import get_current_user


router = APIRouter(
    prefix="/cart",
    tags=["Cart"],
)


# =========================
# Get or Create User Cart
# =========================

def get_or_create_cart(
    db: Session,
    user_id: int,
) -> Cart:
    cart = db.query(Cart).filter(
        Cart.user_id == user_id
    ).first()

    if not cart:
        cart = Cart(
            user_id=user_id,
        )

        db.add(cart)
        db.commit()
        db.refresh(cart)

    return cart


# =========================
# Build Cart Response
# =========================

def build_cart_response(
    db: Session,
    cart: Cart,
) -> CartResponse:
    cart_items = db.query(
        CartItem,
        Product,
    ).join(
        Product,
        Product.id == CartItem.product_id,
    ).filter(
        CartItem.cart_id == cart.id,
    ).all()

    total_amount = 0.0
    response_items = []

    for cart_item, product in cart_items:
        total_amount += product.price * cart_item.quantity

        response_items.append(
            CartItemResponse(
                id=cart_item.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
            )
        )

    return CartResponse(
        items=response_items,
        total_amount=round(total_amount, 2),
    )


# =========================
# Add Item to Cart
# =========================

@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
)
def add_to_cart(
    item_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(
        Product.id == item_data.product_id,
        Product.is_active == True,
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or inactive",
        )

    cart = get_or_create_cart(
        db,
        current_user.id,
    )

    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == product.id,
    ).first()

    if existing_item:
        existing_item.quantity += item_data.quantity
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=item_data.quantity,
        )

        db.add(cart_item)

    db.commit()
    db.refresh(cart)

    return build_cart_response(
        db,
        cart,
    )


# =========================
# Get Cart
# =========================

@router.get(
    "",
    response_model=CartResponse,
)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = get_or_create_cart(
        db,
        current_user.id,
    )

    return build_cart_response(
        db,
        cart,
    )


# =========================
# Update Cart Item
# =========================

@router.put(
    "/items/{item_id}",
    response_model=CartResponse,
)
def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = get_or_create_cart(
        db,
        current_user.id,
    )

    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id,
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    product = db.query(Product).filter(
        Product.id == cart_item.product_id,
        Product.is_active == True,
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or inactive",
        )

    cart_item.quantity = item_data.quantity

    db.commit()
    db.refresh(cart)

    return build_cart_response(
        db,
        cart,
    )


# =========================
# Remove Cart Item
# =========================

@router.delete(
    "/items/{item_id}",
    response_model=CartResponse,
)
def remove_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = get_or_create_cart(
        db,
        current_user.id,
    )

    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id,
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )

    db.delete(cart_item)
    db.commit()
    db.refresh(cart)

    return build_cart_response(
        db,
        cart,
    )


# =========================
# Clear Cart
# =========================

@router.delete(
    "/clear",
    response_model=CartResponse,
)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart = get_or_create_cart(
        db,
        current_user.id,
    )

    db.query(CartItem).filter(
        CartItem.cart_id == cart.id
    ).delete(
        synchronize_session=False
    )

    db.commit()
    db.refresh(cart)

    return build_cart_response(
        db,
        cart,
    )