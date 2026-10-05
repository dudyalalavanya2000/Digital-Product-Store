
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, Payment, User
from ..schemas import CheckoutRequest, CheckoutResponse
from ..services.auth_service import get_current_user
from ..stripe_config import STRIPE_WEBHOOK_SECRET, stripe


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


# =========================
# Create Stripe Checkout Session
# =========================

@router.post(
    "/create-checkout-session",
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

    existing_payment = db.query(Payment).filter(
        Payment.order_id == order.id
    ).first()

    if existing_payment:
        if existing_payment.status.lower() == "paid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order has already been paid",
            )

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    "price_data": {
                        "currency": "inr",
                        "product_data": {
                            "name": f"Digital Product Order #{order.id}",
                        },
                        "unit_amount": int(order.amount * 100),
                    },
                    "quantity": 1,
                }
            ],
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

    if existing_payment:
        existing_payment.amount = order.amount
        existing_payment.status = "pending"
        existing_payment.stripe_session_id = checkout_session.id
        existing_payment.stripe_payment_intent_id = None

    else:
        payment = Payment(
            order_id=order.id,
            amount=order.amount,
            status="pending",
            stripe_session_id=checkout_session.id,
        )

        db.add(payment)

    db.commit()

    return {
        "checkout_url": checkout_session.url
    }


# =========================
# Stripe Webhook
# =========================

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook secret is not configured",
        )

    payload = await request.body()

    signature = request.headers.get("stripe-signature")

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature",
        )

    # =========================
    # Verify Stripe Webhook
    # =========================

    try:
        event = stripe.Webhook.construct_event(
            payload,
            signature,
            STRIPE_WEBHOOK_SECRET,
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook payload",
        )

    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe webhook signature",
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Stripe webhook",
        )

    # =========================
    # Checkout Completed
    # =========================

    if event["type"] == "checkout.session.completed":

        session = event["data"]["object"].to_dict()

        order_id = session.get(
            "metadata",
            {},
        ).get("order_id")

        if order_id:

            order = db.query(Order).filter(
                Order.id == int(order_id)
            ).first()

            if order:

                # Update order status
                order.status = "paid"

                # Find existing payment
                payment = db.query(Payment).filter(
                    Payment.order_id == order.id
                ).first()

                if payment:

                    payment.status = "paid"

                    payment.stripe_session_id = session.get("id")

                    payment.stripe_payment_intent_id = session.get(
                        "payment_intent"
                    )

                else:

                    payment = Payment(
                        order_id=order.id,
                        amount=order.amount,
                        status="paid",
                        stripe_session_id=session.get("id"),
                        stripe_payment_intent_id=session.get(
                            "payment_intent"
                        ),
                    )

                    db.add(payment)

                db.commit()

    # =========================
    # Checkout Expired
    # =========================

    elif event["type"] == "checkout.session.expired":

        session = event["data"]["object"].to_dict()

        order_id = session.get(
            "metadata",
            {},
        ).get("order_id")

        if order_id:

            order = db.query(Order).filter(
                Order.id == int(order_id)
            ).first()

            if order and order.status.lower() == "pending":

                # Cancel order
                order.status = "cancelled"

                # Find payment
                payment = db.query(Payment).filter(
                    Payment.order_id == order.id
                ).first()

                if payment:
                    payment.status = "cancelled"

                db.commit()

    return {
        "status": "success"
    }
