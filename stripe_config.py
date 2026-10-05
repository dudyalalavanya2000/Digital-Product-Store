import os

import stripe
from dotenv import load_dotenv


# =========================
# Load Environment Variables
# =========================

load_dotenv()


# =========================
# Stripe Configuration
# =========================

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


if not STRIPE_SECRET_KEY:
    raise RuntimeError(
        "STRIPE_SECRET_KEY is not configured in the .env file"
    )


# =========================
# Configure Stripe
# =========================

stripe.api_key = STRIPE_SECRET_KEY