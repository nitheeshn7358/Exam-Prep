# System Architecture
## Exam Prep Web Application

**Version:** 1.0
**Date:** 2026-03-16

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│              React + Tailwind CSS (Vite)                │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│   │   Auth   │ │ Upload   │ │  Quiz /  │ │Dashboard │  │
│   │  Pages   │ │  Notes   │ │  Exam    │ │          │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS / REST API
┌───────────────────────▼─────────────────────────────────┐
│                     BACKEND                             │
│                  FastAPI (Python)                       │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐             │
│  │   Auth    │ │  Notes /  │ │   Quiz /  │             │
│  │  Router   │ │  Upload   │ │   Exam    │             │
│  │           │ │  Router   │ │  Router   │             │
│  └───────────┘ └─────┬─────┘ └─────┬─────┘             │
└────────────────────┬─┴─────────────┴───────────────────┘
                     │                │
          ┌──────────▼───┐    ┌───────▼────────┐
          │  File Storage │    │   Claude API   │
          │  (S3/Supabase)│    │ (Question Gen) │
          └──────────────┘    └────────────────┘
                     │
          ┌──────────▼───────────┐
          │      PostgreSQL       │
          │  (Users, Notes,       │
          │   Questions, Sessions)│
          └──────────────────────┘
```

---

## 2. Frontend Architecture (React)

### 2.1 Tech Stack
| Tool | Purpose |
|---|---|
| Vite | Build tool |
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| TanStack Query | Server state + caching |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Zustand | Global client state (auth, user) |

### 2.2 Folder Structure
```
src/
├── assets/              # Static images, icons
├── components/          # Reusable UI components
│   ├── common/          # Button, Input, Modal, Card, etc.
│   ├── quiz/            # QuizCard, OptionButton, Timer, etc.
│   └── dashboard/       # ScoreChart, WeakTopicCard, etc.
├── pages/               # Route-level components
│   ├── Auth/            # Login, Signup
│   ├── Dashboard/       # Home dashboard
│   ├── Upload/          # Notes upload page
│   ├── Quiz/            # MCQ quiz mode
│   ├── Exam/            # Mock exam mode
│   └── Results/         # Score report page
├── hooks/               # Custom React hooks
├── services/            # API call functions (axios)
├── store/               # Zustand global state
├── utils/               # Helpers, formatters
└── App.jsx              # Routes + layout
```

### 2.3 Page Routes
| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing / redirect to dashboard | No |
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/dashboard` | Progress dashboard | Yes |
| `/upload` | Upload notes | Yes |
| `/quiz/:noteId` | MCQ quiz session | Yes |
| `/exam/:noteId` | Mock timed exam | Yes |
| `/results/:sessionId` | Score report | Yes |

---

## 3. Backend Architecture (FastAPI)

### 3.1 Tech Stack
| Tool | Purpose |
|---|---|
| FastAPI | API framework |
| SQLAlchemy | ORM |
| Alembic | DB migrations |
| PyJWT | JWT token auth |
| boto3 / supabase-py | File storage |
| anthropic SDK | Claude API calls |
| pydantic | Request/response validation |

### 3.2 Folder Structure
```
app/
├── main.py              # FastAPI app entry point
├── config.py            # Env vars, settings
├── database.py          # DB connection + session
├── models/              # SQLAlchemy ORM models
│   ├── user.py
│   ├── note.py
│   ├── question.py
│   └── session.py
├── schemas/             # Pydantic request/response schemas
│   ├── user.py
│   ├── note.py
│   ├── question.py
│   └── session.py
├── routers/             # API route handlers
│   ├── auth.py
│   ├── notes.py
│   ├── questions.py
│   └── sessions.py
├── services/            # Business logic
│   ├── ai_service.py    # Claude API integration
│   ├── file_service.py  # S3/storage upload
│   └── quiz_service.py  # Quiz/exam logic
└── utils/               # Auth helpers, validators
```

### 3.3 API Endpoints
#### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/logout` | Invalidate token |
| GET | `/auth/me` | Get current user profile |

#### Notes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/notes/upload` | Upload file + metadata |
| GET | `/notes` | List all notes for user |
| GET | `/notes/:id` | Get single note |
| DELETE | `/notes/:id` | Delete note |

#### Questions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/questions/generate` | Generate MCQs from note (calls Claude) |
| GET | `/questions/:noteId` | Get all questions for a note |

#### Sessions (Quiz / Exam)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/sessions/start` | Start a quiz or exam session |
| POST | `/sessions/:id/answer` | Submit an answer |
| POST | `/sessions/:id/submit` | Submit full exam |
| GET | `/sessions/:id/result` | Get session score report |
| GET | `/sessions` | Get all past sessions |

#### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/summary` | Scores, streaks, weak topics |

---

## 4. Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | VARCHAR | Unique |
| password_hash | VARCHAR | Bcrypt hashed |
| name | VARCHAR | |
| grade | VARCHAR | e.g. "Grade 10" |
| created_at | TIMESTAMP | |

### notes
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| title | VARCHAR | |
| subject | VARCHAR | |
| file_url | VARCHAR | S3/storage URL |
| file_size_bytes | BIGINT | Max 1GB |
| expires_at | TIMESTAMP | Upload date + 30 days |
| created_at | TIMESTAMP | |

### questions
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| note_id | UUID | FK → notes |
| question_text | TEXT | |
| options | JSONB | Array of 4 options |
| correct_option | INTEGER | Index 0–3 |
| explanation | TEXT | AI-generated explanation |
| difficulty | VARCHAR | easy / medium / hard |
| created_at | TIMESTAMP | |

### sessions
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → users |
| note_id | UUID | FK → notes |
| mode | VARCHAR | quiz / exam |
| total_questions | INTEGER | |
| correct_answers | INTEGER | |
| score_percent | FLOAT | |
| duration_seconds | INTEGER | |
| completed_at | TIMESTAMP | |

### session_answers
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| session_id | UUID | FK → sessions |
| question_id | UUID | FK → questions |
| selected_option | INTEGER | |
| is_correct | BOOLEAN | |

---

## 5. AI Integration (Claude API)

### Question Generation Flow
```
User uploads file
      │
      ▼
Backend extracts text from PDF/DOCX
      │
      ▼
Send text + prompt to Claude API
  "Generate N MCQs from the following notes.
   Each question must have 4 options, 1 correct answer,
   and a brief explanation. Return as JSON."
      │
      ▼
Parse JSON response → Save questions to DB
      │
      ▼
Return question count to frontend
```

### Prompt Design
- System prompt sets the role: "You are an exam question generator for K-12 students."
- User can configure N (number of questions)
- Output is structured JSON for easy parsing
- Difficulty can be specified per request

---

## 6. Authentication Flow

```
Signup/Login → Backend validates → Returns JWT
      │
      ▼
Frontend stores JWT in memory (Zustand) +
httpOnly cookie for persistence
      │
      ▼
All API requests send JWT in Authorization header
      │
      ▼
Backend middleware validates JWT on protected routes
```

---

## 7. File Upload Flow

```
User selects file (≤ 1GB, PDF/DOCX/TXT)
      │
      ▼
Frontend sends file to backend (multipart/form-data)
      │
      ▼
Backend validates file type + size
      │
      ▼
Upload to S3 / Supabase Storage
      │
      ▼
Save file URL + metadata to notes table
      │
      ▼
Trigger question generation (async or on-demand)
```

---

## 8. Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
SECRET_KEY=...
ANTHROPIC_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```
