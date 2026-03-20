"""
Stripe payment gateway integration.

Endpoints:
  POST /payments/create-checkout-session   — create a Stripe Checkout session (auth required)
  POST /payments/webhook                   — handle Stripe webhook events (no auth)
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import stripe

from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Price IDs from your Stripe dashboard (set in .env)
PRICE_IDS = {
    "pro_monthly":    os.getenv("STRIPE_PRO_MONTHLY_PRICE_ID", ""),
    "pro_yearly":     os.getenv("STRIPE_PRO_YEARLY_PRICE_ID", ""),
    "school_monthly": os.getenv("STRIPE_SCHOOL_MONTHLY_PRICE_ID", ""),
    "school_yearly":  os.getenv("STRIPE_SCHOOL_YEARLY_PRICE_ID", ""),
}

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

router = APIRouter()


# ── Request / response schemas ────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    plan: str      # "pro" | "school"
    interval: str  # "monthly" | "yearly"


class CheckoutResponse(BaseModel):
    url: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_or_create_stripe_customer(user: User, db: Session) -> str:
    """Return the Stripe customer ID for this user, creating one if needed."""
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer = stripe.Customer.create(
        email=user.email,
        name=user.name,
        metadata={"user_id": str(user.id)},
    )
    user.stripe_customer_id = customer.id
    db.commit()
    return customer.id


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/create-checkout-session", response_model=CheckoutResponse)
def create_checkout_session(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a Stripe Checkout session for the requested plan/interval.
    Returns { url } which the frontend should redirect to.
    """
    key = f"{body.plan}_{body.interval}"
    price_id = PRICE_IDS.get(key)

    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown plan/interval combination: {key}",
        )

    if not stripe.api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment gateway not configured. Please add STRIPE_SECRET_KEY to .env",
        )

    customer_id = _get_or_create_stripe_customer(current_user, db)

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{FRONTEND_URL}/plans?checkout=success",
        cancel_url=f"{FRONTEND_URL}/plans?checkout=cancelled",
        subscription_data={
            "metadata": {"user_id": str(current_user.id), "plan": body.plan},
        },
        allow_promotion_codes=True,
    )

    return CheckoutResponse(url=session.url)


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook events.
    Stripe sends events here when a subscription is created, updated, or cancelled.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    # Verify the webhook signature (skip verification if secret not configured)
    if WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")
    else:
        import json
        event = json.loads(payload)

    event_type = event["type"]

    # ── Subscription activated / updated ─────────────────────────────────────
    if event_type in ("checkout.session.completed", "customer.subscription.updated"):
        if event_type == "checkout.session.completed":
            session_obj = event["data"]["object"]
            customer_id = session_obj.get("customer")
            subscription_id = session_obj.get("subscription")
            plan = (
                session_obj.get("subscription_data", {})
                .get("metadata", {})
                .get("plan", "pro")
            )
        else:
            sub = event["data"]["object"]
            customer_id = sub.get("customer")
            subscription_id = sub.get("id")
            plan = sub.get("metadata", {}).get("plan", "pro")

        if customer_id:
            user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
            if user:
                user.plan = plan
                user.stripe_subscription_id = subscription_id
                db.commit()

    # ── Subscription cancelled ────────────────────────────────────────────────
    elif event_type == "customer.subscription.deleted":
        sub = event["data"]["object"]
        customer_id = sub.get("customer")
        if customer_id:
            user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
            if user:
                user.plan = "free"
                user.stripe_subscription_id = None
                db.commit()

    return {"received": True}
