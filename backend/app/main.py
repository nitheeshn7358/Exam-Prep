from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, notes, questions, sessions, dashboard, analytics, subjects, payments, support
from app.database import engine, Base
import app.models  # noqa: F401 — ensures models are registered

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Exam Prep API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://exam-prep-sigma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(notes.router, prefix="/notes", tags=["notes"])
app.include_router(questions.router, prefix="/questions", tags=["questions"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
app.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(support.router, prefix="/support", tags=["support"])

@app.get("/")
def root():
    return {"status": "Exam Prep API is running"}
