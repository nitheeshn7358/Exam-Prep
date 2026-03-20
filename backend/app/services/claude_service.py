import json
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "google/gemini-2.0-flash-001"


def generate_questions(text: str, num_questions: int) -> list[dict]:
    prompt = f"""You are an exam question generator for K-12 students.

Based on the study notes below, generate exactly {num_questions} multiple choice questions.

Rules:
- Each question must have 4 options labeled A, B, C, D
- Only one option is correct
- Questions should test understanding, not just memorization
- Keep language clear and appropriate for K-12 students
- Return ONLY a valid JSON array, no extra text

Format:
[
  {{
    "question": "What is ...?",
    "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
    "correct_answer": "A",
    "explanation": "Brief explanation of why A is correct."
  }}
]

Study Notes:
\"\"\"
{text[:12000]}
\"\"\"

Return only the JSON array:"""

    response = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 4096,
        },
        timeout=60,
    )

    response.raise_for_status()
    raw = response.json()["choices"][0]["message"]["content"].strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    return json.loads(raw)
