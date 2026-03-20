from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.note import Note
from app.models.question import Question
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/{note_id}")
def get_questions(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    questions = db.query(Question).filter(Question.note_id == note_id).all()
    return [
        {
            "id": q.id,
            "question": q.question,
            "options": q.options,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
        }
        for q in questions
    ]
