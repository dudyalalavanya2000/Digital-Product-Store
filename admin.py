
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, Payment, Product, User
from ..services.auth_service import require_admin


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# =========================
# Admin Dashboard Statistics
# =========================

@router.get(
    "/stats",
)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    total_products = db.query(Product).filter(
        Product.is_active == True
    ).count()

    total_orders = db.query(Order).count()

    paid_orders = db.query(Order).join(
        Payment,
        Payment.order_id == Order.id,
    ).filter(
        Payment.status == "paid",
        Order.status == "paid",
    ).count()

    total_revenue = db.query(
        func.coalesce(
            func.sum(Order.amount),
            0,
        )
    ).join(
        Payment,
        Payment.order_id == Order.id,
    ).filter(
        Payment.status == "paid",
        Order.status == "paid",
    ).scalar()

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "paid_orders": paid_orders,
        "total_revenue": round(
            float(total_revenue or 0),
            2,
        ),
    }
