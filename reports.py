
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, OrderItem, Payment, Product, User
from ..services.auth_service import require_admin


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


# =========================
# Revenue Report
# =========================

@router.get(
    "/revenue",
)
def revenue_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = db.query(
        func.count(Order.id).label("paid_orders"),
        func.coalesce(
            func.sum(Order.amount),
            0,
        ).label("total_revenue"),
    ).join(
        Payment,
        Payment.order_id == Order.id,
    ).filter(
        Payment.status == "paid",
        Order.status == "paid",
    ).first()

    return {
        "paid_orders": result.paid_orders or 0,
        "total_revenue": round(
            float(result.total_revenue or 0),
            2,
        ),
    }


# =========================
# Most Purchased Products
# =========================

@router.get(
    "/most-purchased",
)
def most_purchased_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    results = db.query(
        Product.id.label("product_id"),
        Product.name.label("product_name"),
        func.sum(
            OrderItem.quantity
        ).label("quantity_purchased"),
        func.sum(
            OrderItem.subtotal
        ).label("total_revenue"),
    ).join(
        OrderItem,
        OrderItem.product_id == Product.id,
    ).join(
        Order,
        Order.id == OrderItem.order_id,
    ).join(
        Payment,
        Payment.order_id == Order.id,
    ).filter(
        Payment.status == "paid",
        Order.status == "paid",
    ).group_by(
        Product.id,
        Product.name,
    ).order_by(
        func.sum(
            OrderItem.quantity
        ).desc()
    ).all()

    return {
        "items": [
            {
                "product_id": row.product_id,
                "product_name": row.product_name,
                "quantity_purchased": row.quantity_purchased,
                "total_revenue": round(
                    float(row.total_revenue or 0),
                    2,
                ),
            }
            for row in results
        ]
    }


# =========================
# User Order History
# =========================

@router.get(
    "/user-orders",
)
def user_order_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    results = db.query(
        User.id.label("user_id"),
        User.name.label("user_name"),
        User.email.label("email"),
        func.count(
            Order.id
        ).label("total_orders"),
        func.coalesce(
            func.sum(Order.amount),
            0,
        ).label("total_spent"),
    ).join(
        Order,
        Order.user_id == User.id,
    ).join(
        Payment,
        Payment.order_id == Order.id,
    ).filter(
        Payment.status == "paid",
        Order.status == "paid",
    ).group_by(
        User.id,
        User.name,
        User.email,
    ).order_by(
        func.sum(Order.amount).desc()
    ).all()

    return {
        "items": [
            {
                "user_id": row.user_id,
                "user_name": row.user_name,
                "email": row.email,
                "total_orders": row.total_orders,
                "total_spent": round(
                    float(row.total_spent or 0),
                    2,
                ),
            }
            for row in results
        ]
    }


# =========================
# Never Purchased Products
# =========================

@router.get(
    "/never-purchased",
)
def never_purchased_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    products = db.query(Product).filter(
        ~db.query(OrderItem).join(
            Order,
            Order.id == OrderItem.order_id,
        ).join(
            Payment,
            Payment.order_id == Order.id,
        ).filter(
            OrderItem.product_id == Product.id,
            Payment.status == "paid",
            Order.status == "paid",
        ).exists()
    ).order_by(
        Product.id.asc()
    ).all()

    return {
        "items": [
            {
                "product_id": product.id,
                "product_name": product.name,
                "price": product.price,
                "is_active": product.is_active,
            }
            for product in products
        ]
    }
