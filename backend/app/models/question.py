from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)   # {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer = Column(String, nullable=False)  # "A", "B", "C", or "D"
    explanation = Column(Text, nullable=True)

    note = relationship("Note", back_populates="questions")
