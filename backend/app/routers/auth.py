import os
import secrets
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user
from app.utils.email import send_reset_email, send_support_email

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        grade=body.grade,
        plan="free",
        trial_ends_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id})
    return {"access_token": token, "user": user}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id})
    return {"access_token": token, "user": user}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


class UpdateProfileRequest(BaseModel):
    name: str
    grade: int | None = None


@router.patch("/profile", response_model=UserResponse)
def update_profile(body: UpdateProfileRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.name = body.name
    current_user.grade = body.grade
    db.commit()
    db.refresh(current_user)
    return current_user


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    # Always return success to avoid revealing if email exists
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(minutes=30)
        db.commit()
        try:
            send_reset_email(user.email, token)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to send email. Please try again.")
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == body.token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    user.hashed_password = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password reset successfully."}


class GoogleLoginRequest(BaseModel):
    credential: str
    email: str
    name: str


@router.post("/google", response_model=TokenResponse)
async def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    if not body.email:
        raise HTTPException(status_code=400, detail="Could not get email from Google.")

    # Find or create user
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        user = User(
            name=body.name or body.email.split("@")[0],
            email=body.email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            plan="free",
            trial_ends_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.id})
    return {"access_token": token, "user": user}


class SupportRequest(BaseModel):
    subject: str
    message: str


@router.post("/support")
def submit_support(body: SupportRequest, current_user: User = Depends(get_current_user)):
    if not body.subject.strip() or not body.message.strip():
        raise HTTPException(status_code=400, detail="Subject and message are required.")
    try:
        send_support_email(
            user_name=current_user.name,
            user_email=current_user.email,
            subject=body.subject.strip(),
            message=body.message.strip(),
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again.")
    return {"message": "Your message has been sent. We'll get back to you shortly."}
