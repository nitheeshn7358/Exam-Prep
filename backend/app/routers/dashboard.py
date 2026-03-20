from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.note import Note
from app.models.session import Session as SessionModel
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_notes = db.query(func.count(Note.id)).filter(Note.user_id == current_user.id).scalar()
    total_sessions = db.query(func.count(SessionModel.id)).filter(SessionModel.user_id == current_user.id).scalar()
    avg_score = db.query(func.avg(SessionModel.score)).filter(SessionModel.user_id == current_user.id).scalar()

    return {
        "total_notes": total_notes or 0,
        "total_sessions": total_sessions or 0,
        "avg_score": round(avg_score, 1) if avg_score is not None else None,
    }
