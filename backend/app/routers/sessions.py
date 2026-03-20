import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Any

from app.database import get_db
from app.models.session import Session
from app.models.note import Note
from app.models.subject import Subject
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter()


class SessionCreate(BaseModel):
    note_id: int | None = None
    subject_id: int | None = None
    mode: str   # 'quiz' or 'exam'
    score: float
    total: int
    correct: int
    violations: int = 0
    answers: list[Any] | None = None


@router.post("")
def save_session(
    data: SessionCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = Session(
        user_id=current_user.id,
        note_id=data.note_id,
        subject_id=data.subject_id,
        mode=data.mode,
        score=data.score,
        total=data.total,
        correct=data.correct,
        violations=data.violations,
        answers_json=json.dumps(data.answers) if data.answers else None,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "score": session.score}


@router.get("")
def get_sessions(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(Session)
        .filter(Session.user_id == current_user.id)
        .order_by(desc(Session.created_at))
        .all()
    )
    result = []
    for s in sessions:
        note = db.query(Note).filter(Note.id == s.note_id).first() if s.note_id else None
        subject = db.query(Subject).filter(Subject.id == s.subject_id).first() if s.subject_id else None
        result.append({
            "id": s.id,
            "mode": s.mode,
            "score": s.score,
            "total": s.total,
            "correct": s.correct,
            "violations": s.violations or 0,
            "created_at": s.created_at,
            "note_title": note.title if note else ("Deleted Note" if not subject else None),
            "note_id": s.note_id,
            "subject_id": s.subject_id,
            "subject_name": subject.name if subject else None,
        })
    return result


@router.get("/{session_id}")
def get_session_detail(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    s = db.query(Session).filter(Session.id == session_id, Session.user_id == current_user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    note = db.query(Note).filter(Note.id == s.note_id).first() if s.note_id else None
    subject = db.query(Subject).filter(Subject.id == s.subject_id).first() if s.subject_id else None
    return {
        "id": s.id,
        "mode": s.mode,
        "score": s.score,
        "total": s.total,
        "correct": s.correct,
        "violations": s.violations or 0,
        "created_at": s.created_at,
        "note_title": note.title if note else ("Deleted Note" if not subject else None),
        "note_id": s.note_id,
        "subject_id": s.subject_id,
        "subject_name": subject.name if subject else None,
        "answers": json.loads(s.answers_json) if s.answers_json else [],
    }
