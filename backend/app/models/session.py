from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, func
from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    mode = Column(String, nullable=False)   # 'quiz' or 'exam'
    score = Column(Float, nullable=False)   # percentage 0-100
    total = Column(Integer, nullable=False)
    correct = Column(Integer, nullable=False)
    violations = Column(Integer, default=0)
    answers_json = Column(Text, nullable=True)  # JSON array of answer details
    created_at = Column(DateTime, server_default=func.now())
