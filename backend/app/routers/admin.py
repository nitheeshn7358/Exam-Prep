import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

router = APIRouter()

ADMIN_SECRET = os.getenv("ADMIN_SECRET_KEY", "")


def verify_admin(key: str = Query(..., alias="key")):
    if not ADMIN_SECRET or key != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("/users")
def list_users(db: Session = Depends(get_db), _=Depends(verify_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()

    now = datetime.now(timezone.utc)

    plan_counts = {"free": 0, "pro": 0, "school": 0}
    user_list = []
    for u in users:
        plan_counts[u.plan] = plan_counts.get(u.plan, 0) + 1
        trial_active = (
            u.trial_ends_at is not None
            and u.trial_ends_at.replace(tzinfo=timezone.utc) > now
        )
        user_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "grade": u.grade,
            "plan": u.plan,
            "trial_active": trial_active,
            "trial_ends_at": u.trial_ends_at.isoformat() if u.trial_ends_at else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "stripe_customer_id": u.stripe_customer_id,
        })

    return {
        "total_users": len(users),
        "plan_breakdown": plan_counts,
        "users": user_list,
    }
