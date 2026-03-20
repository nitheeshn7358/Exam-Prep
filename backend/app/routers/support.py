from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.utils.email import send_support_email

router = APIRouter()


class SupportRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/contact")
def contact(body: SupportRequest):
    try:
        send_support_email(
            user_name=body.name,
            user_email=body.email,
            subject=body.subject,
            message=body.message,
        )
        return {"status": "sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send message. Please try again.")
