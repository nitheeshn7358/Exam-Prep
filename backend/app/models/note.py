from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    title = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx, txt
    text_content = Column(Text, nullable=False)
    question_count = Column(Integer, default=0)
    file_size = Column(Integer, default=0)  # bytes
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    questions = relationship("Question", back_populates="note", cascade="all, delete-orphan")
    subject = relationship("Subject", back_populates="notes")
