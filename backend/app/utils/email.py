import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_support_email(user_name: str, user_email: str, subject: str, message: str):
    mail_from = os.getenv("MAIL_FROM")
    mail_password = os.getenv("MAIL_PASSWORD")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[ExamPrep Support] {subject}"
    msg["From"] = f"ExamPrep Support <{mail_from}>"
    msg["To"] = mail_from
    msg["Reply-To"] = user_email

    html = f"""
    <div style="font-family: sans-serif; max-width: 560px; margin: auto; padding: 32px;">
      <h2 style="color: #4f46e5;">New Support Request</h2>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <tr><td style="padding:6px 0; color:#6b7280; font-size:13px; width:80px;">From</td>
            <td style="padding:6px 0; font-size:13px;"><strong>{user_name}</strong> &lt;{user_email}&gt;</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280; font-size:13px;">Subject</td>
            <td style="padding:6px 0; font-size:13px;">{subject}</td></tr>
      </table>
      <div style="background:#f9fafb; border-radius:8px; padding:16px; font-size:14px; color:#374151; white-space:pre-wrap;">{message}</div>
      <p style="margin-top:24px; color:#9ca3af; font-size:12px;">Reply directly to this email to respond to the user.</p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(mail_from, mail_password)
        server.sendmail(mail_from, mail_from, msg.as_string())


def send_reset_email(to_email: str, reset_token: str):
    mail_from = os.getenv("MAIL_FROM")
    mail_password = os.getenv("MAIL_PASSWORD")

    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your ExamPrep password"
    msg["From"] = f"ExamPrep <{mail_from}>"
    msg["To"] = to_email

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
      <h2 style="color: #4f46e5;">Reset your password</h2>
      <p>Click the button below to reset your ExamPrep password. This link expires in <strong>30 minutes</strong>.</p>
      <a href="{reset_link}"
         style="display: inline-block; margin-top: 16px; background: linear-gradient(to right, #4f46e5, #7c3aed);
                color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Reset Password
      </a>
      <p style="margin-top: 24px; color: #9ca3af; font-size: 13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(mail_from, mail_password)
        server.sendmail(mail_from, to_email, msg.as_string())
