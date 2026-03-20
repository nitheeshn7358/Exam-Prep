import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.subject import Subject
from app.models.note import Note
from app.models.question import Question
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter()


class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


@router.post("")
def create_subject(
    data: SubjectCreate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subject = Subject(
        user_id=current_user.id,
        name=data.name.strip(),
        description=data.description,
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return {
        "id": subject.id,
        "name": subject.name,
        "description": subject.description,
        "created_at": subject.created_at.isoformat(),
        "note_count": 0,
        "question_count": 0,
    }


@router.get("")
def list_subjects(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subjects = (
        db.query(Subject)
        .filter(Subject.user_id == current_user.id)
        .order_by(Subject.created_at.desc())
        .all()
    )
    result = []
    for s in subjects:
        notes = db.query(Note).filter(Note.subject_id == s.id).all()
        question_count = sum(n.question_count for n in notes)
        result.append({
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "created_at": s.created_at.isoformat(),
            "note_count": len(notes),
            "question_count": question_count,
        })
    return result


@router.get("/{subject_id}")
def get_subject(
    subject_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    notes = db.query(Note).filter(Note.subject_id == subject_id).all()
    question_count = sum(n.question_count for n in notes)

    return {
        "id": subject.id,
        "name": subject.name,
        "description": subject.description,
        "created_at": subject.created_at.isoformat(),
        "note_count": len(notes),
        "question_count": question_count,
        "notes": [
            {
                "id": n.id,
                "title": n.title,
                "file_type": n.file_type,
                "question_count": n.question_count,
                "created_at": n.created_at.isoformat(),
                "expires_at": n.expires_at.isoformat(),
            }
            for n in notes
        ],
    }


@router.patch("/{subject_id}")
def update_subject(
    subject_id: int,
    data: SubjectUpdate,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    if data.name is not None:
        subject.name = data.name.strip()
    if data.description is not None:
        subject.description = data.description
    db.commit()
    db.refresh(subject)
    return {"id": subject.id, "name": subject.name, "description": subject.description}


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted."}


@router.get("/{subject_id}/questions")
def get_subject_questions(
    subject_id: int,
    limit: int = 0,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pool all questions from all notes in a subject. Optionally limit count (random sample)."""
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    note_ids = [
        n.id for n in db.query(Note).filter(Note.subject_id == subject_id).all()
    ]
    if not note_ids:
        raise HTTPException(status_code=422, detail="This subject has no uploaded notes yet.")

    questions = (
        db.query(Question)
        .filter(Question.note_id.in_(note_ids))
        .all()
    )
    if not questions:
        raise HTTPException(status_code=422, detail="No questions found in this subject.")

    # Shuffle and optionally limit
    random.shuffle(questions)
    if limit and limit < len(questions):
        questions = questions[:limit]

    return {
        "subject_id": subject_id,
        "subject_name": subject.name,
        "total": len(questions),
        "questions": [
            {
                "id": q.id,
                "question": q.question,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation or "",
            }
            for q in questions
        ],
    }
