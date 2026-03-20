from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.note import Note
from app.models.question import Question
from app.models.user import User
from app.utils.auth import get_current_user
from app.utils.extract_text import extract_text
from app.services.claude_service import generate_questions

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

FREE_UPLOAD_LIMIT = 3

# Storage limits per plan (bytes)
STORAGE_LIMITS = {
    "free":   5  * 1024 * 1024 * 1024,   # 5 GB
    "pro":    50 * 1024 * 1024 * 1024,   # 50 GB
    "school": 500 * 1024 * 1024 * 1024,  # 500 GB
}


@router.post("/upload")
async def upload_note(
    file: UploadFile = File(...),
    num_questions: int = Form(10),
    subject_id: int = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Enforce upload limit for free plan
    if current_user.plan == "free":
        note_count = db.query(Note).filter(Note.user_id == current_user.id).count()
        if note_count >= FREE_UPLOAD_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"Free plan is limited to {FREE_UPLOAD_LIMIT} uploads. Upgrade to Pro for unlimited uploads."
            )

    # Validate file type
    file_type = ALLOWED_TYPES.get(file.content_type)
    if not file_type:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported.")

    # Read file
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 25 MB limit.")

    # Enforce storage limit
    from sqlalchemy import func as sqlfunc
    used_bytes = db.query(sqlfunc.coalesce(sqlfunc.sum(Note.file_size), 0)).filter(Note.user_id == current_user.id).scalar()
    limit_bytes = STORAGE_LIMITS.get(current_user.plan, STORAGE_LIMITS["free"])
    if used_bytes + len(file_bytes) > limit_bytes:
        limit_gb = limit_bytes // (1024 ** 3)
        raise HTTPException(
            status_code=403,
            detail=f"Storage limit reached ({limit_gb} GB on {current_user.plan} plan). Delete old notes or upgrade your plan."
        )

    # Extract text
    try:
        text = extract_text(file_bytes, file_type)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text: {str(e)}")

    if len(text.strip()) < 50:
        raise HTTPException(status_code=422, detail="File appears to be empty or has too little text.")

    # Clamp question count
    num_questions = max(1, min(num_questions, 50))

    # Generate questions via Claude
    try:
        generated = generate_questions(text, num_questions)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI question generation failed: {str(e)}")

    # Save note
    title = file.filename or "Untitled Note"
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    note = Note(
        user_id=current_user.id,
        subject_id=subject_id,
        title=title,
        file_type=file_type,
        text_content=text[:50000],  # cap stored text at 50k chars
        question_count=len(generated),
        file_size=len(file_bytes),
        expires_at=expires_at,
    )
    db.add(note)
    db.flush()  # get note.id before committing

    # Save questions
    for q in generated:
        question = Question(
            note_id=note.id,
            question=q["question"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            explanation=q.get("explanation", ""),
        )
        db.add(question)

    db.commit()
    db.refresh(note)

    return {
        "id": note.id,
        "title": note.title,
        "question_count": note.question_count,
        "expires_at": note.expires_at.isoformat(),
    }


@router.get("/")
def list_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notes = (
        db.query(Note)
        .filter(Note.user_id == current_user.id)
        .order_by(Note.created_at.desc())
        .all()
    )
    return [
        {
            "id": n.id,
            "title": n.title,
            "question_count": n.question_count,
            "expires_at": n.expires_at.isoformat(),
            "created_at": n.created_at.isoformat(),
        }
        for n in notes
    ]


@router.get("/count")
def note_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import func as sqlfunc
    count = db.query(Note).filter(Note.user_id == current_user.id).count()
    used_bytes = db.query(sqlfunc.coalesce(sqlfunc.sum(Note.file_size), 0)).filter(Note.user_id == current_user.id).scalar()
    limit_bytes = STORAGE_LIMITS.get(current_user.plan, STORAGE_LIMITS["free"])
    return {
        "count": count,
        "plan": current_user.plan,
        "limit": 3 if current_user.plan == "free" else None,
        "storage_used": used_bytes,
        "storage_limit": limit_bytes,
    }


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted."}
