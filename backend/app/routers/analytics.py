from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func, desc

from app.database import get_db
from app.models.session import Session
from app.models.note import Note
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("")
def get_analytics(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(Session)
        .filter(Session.user_id == current_user.id)
        .order_by(Session.created_at)
        .all()
    )

    if not sessions:
        return {
            "summary": {"total_sessions": 0, "avg_score": None, "best_score": None, "total_questions": 0, "total_correct": 0, "total_violations": 0},
            "score_trend": [],
            "mode_breakdown": {"quiz": 0, "exam": 0},
            "score_distribution": {"0-49": 0, "50-79": 0, "80-100": 0},
            "by_note": [],
            "violations_summary": {"clean": 0, "warned": 0, "terminated": 0},
            "recent_sessions": [],
        }

    total = len(sessions)
    avg_score = sum(s.score for s in sessions) / total
    best_score = max(s.score for s in sessions)
    total_questions = sum(s.total for s in sessions)
    total_correct = sum(s.correct for s in sessions)
    total_violations = sum((s.violations or 0) for s in sessions)

    # Score trend — last 20 sessions with date label
    trend = []
    for s in sessions[-20:]:
        note = db.query(Note).filter(Note.id == s.note_id).first() if s.note_id else None
        trend.append({
            "date": s.created_at.strftime("%d %b"),
            "score": round(s.score),
            "mode": s.mode,
            "note_title": note.title if note else "Deleted",
        })

    # Mode breakdown
    quiz_count = sum(1 for s in sessions if s.mode == "quiz")
    exam_count = sum(1 for s in sessions if s.mode == "exam")

    # Score distribution
    dist = {"0-49": 0, "50-79": 0, "80-100": 0}
    for s in sessions:
        if s.score < 50:
            dist["0-49"] += 1
        elif s.score < 80:
            dist["50-79"] += 1
        else:
            dist["80-100"] += 1

    # Performance by note (avg score per note)
    note_map = {}
    for s in sessions:
        key = s.note_id
        if key not in note_map:
            note_map[key] = {"scores": [], "note_id": key}
        note_map[key]["scores"].append(s.score)

    by_note = []
    for key, val in note_map.items():
        note = db.query(Note).filter(Note.id == key).first() if key else None
        title = note.title if note else "Deleted Note"
        # Truncate long titles
        if len(title) > 30:
            title = title[:28] + "…"
        by_note.append({
            "note_title": title,
            "avg_score": round(sum(val["scores"]) / len(val["scores"])),
            "sessions": len(val["scores"]),
        })
    by_note.sort(key=lambda x: x["avg_score"], reverse=True)

    # Violations summary
    clean = sum(1 for s in sessions if (s.violations or 0) == 0)
    warned = sum(1 for s in sessions if (s.violations or 0) == 1)
    terminated = sum(1 for s in sessions if (s.violations or 0) >= 2)

    # Recent 5 sessions
    recent = []
    for s in reversed(sessions[-5:]):
        note = db.query(Note).filter(Note.id == s.note_id).first() if s.note_id else None
        recent.append({
            "id": s.id,
            "mode": s.mode,
            "score": round(s.score),
            "note_title": note.title if note else "Deleted",
            "created_at": s.created_at,
            "violations": s.violations or 0,
        })

    return {
        "summary": {
            "total_sessions": total,
            "avg_score": round(avg_score),
            "best_score": round(best_score),
            "total_questions": total_questions,
            "total_correct": total_correct,
            "total_violations": total_violations,
        },
        "score_trend": trend,
        "mode_breakdown": {"quiz": quiz_count, "exam": exam_count},
        "score_distribution": dist,
        "by_note": by_note,
        "violations_summary": {"clean": clean, "warned": warned, "terminated": terminated},
        "recent_sessions": recent,
    }
