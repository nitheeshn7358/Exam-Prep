# Product Requirements Document (PRD)
## Exam Prep Web Application

**Version:** 1.0
**Date:** 2026-03-16
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary
An AI-powered web application that helps K-12 students prepare for exams by uploading their own study notes and practicing through MCQ quizzes and mock exams. The platform tracks progress over time and surfaces weak areas to guide focused study.

### 1.2 Problem Statement
K-12 students struggle to convert their class notes and textbooks into effective practice. Passive reading doesn't reveal gaps in knowledge, and students often don't know what they don't know until the actual exam. There is no easy way to turn personal notes into actionable practice questions.

### 1.3 Goal
Enable students to upload their study material and immediately start practicing with auto-generated MCQs and timed mock exams — with a dashboard that shows progress and highlights weak areas.

---

## 2. Target Users

**Primary:** K-12 students (ages 10–18)
**Secondary:** Parents monitoring their child's progress (future consideration)

### User Persona
- **Name:** Priya, 15, Grade 10
- **Goal:** Prepare for upcoming board exams using her own class notes
- **Pain Points:** Doesn't know how to turn notes into practice questions; gets bored re-reading; no feedback on weak topics
- **Comfort Level:** Comfortable with apps and mobile-first UX

---

## 3. Core Features (MVP)

### 3.1 Authentication & User Accounts
| Feature | Details |
|---|---|
| Sign up / Login | Email + password, or Google OAuth |
| Student profile | Name, grade level, subjects |
| Session persistence | Stay logged in across sessions |

### 3.2 Notes Upload & Processing
| Feature | Details |
|---|---|
| Upload formats | PDF, DOCX, TXT, plain text paste |
| AI processing | Extract key concepts and generate MCQs from content |
| Subject tagging | User assigns subject/topic to each upload |
| Multiple uploads | Support multiple notes per subject |

### 3.3 MCQ Quiz Mode
| Feature | Details |
|---|---|
| Question generation | AI generates 4-option MCQs from uploaded notes |
| Instant feedback | Show correct/incorrect immediately after each answer |
| Explanation | Brief AI explanation of why the correct answer is right |
| Session length | User selects 5, 10, or 20 questions per session |
| Difficulty | Starts medium; adapts based on performance |

### 3.4 Mock / Timed Exam Mode
| Feature | Details |
|---|---|
| Exam simulation | Full set of questions with a countdown timer |
| No feedback during | Mimics real exam — no hints until submission |
| Score report | Detailed breakdown after submission: score, correct/incorrect, topic breakdown |
| Time limit | User sets duration (e.g., 30, 60, 90 minutes) |
| Review mode | Post-exam review of all questions with explanations |

### 3.5 Progress Dashboard
| Feature | Details |
|---|---|
| Overall score trend | Line chart of quiz/exam scores over time |
| Subject breakdown | Accuracy % per subject/topic |
| Weak topics | Highlighted topics with below-average accuracy |
| Study streak | Daily streak tracker |
| Recent activity | History of last 5 sessions |

---

## 4. User Flows

### 4.1 First-Time User
```
Sign Up → Set up profile (name, grade, subjects) → Upload notes →
AI processes notes → Start first quiz
```

### 4.2 Returning User
```
Log in → View dashboard → See weak topics →
Choose quiz or mock exam → Complete session → View results → Dashboard updated
```

### 4.3 Upload & Practice Flow
```
Upload PDF/doc → Tag subject + topic → AI generates questions →
Choose mode (Quiz / Mock Exam) → Practice → Review results
```

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Question generation within 10 seconds of upload |
| Uptime | 99.5% availability |
| Security | User data encrypted at rest and in transit; no sharing of uploaded notes |
| Privacy | Student notes are private; not used to train models |
| Responsiveness | Works on desktop, tablet, and mobile |
| Accessibility | WCAG 2.1 AA compliant |

---

## 6. Out of Scope (MVP)

- Flashcard / spaced repetition mode
- AI open-ended answer grading
- Parent/teacher dashboards
- Leaderboards or social features
- Pre-built question banks (content provided by platform)
- Mobile native app (iOS/Android)
- Offline mode

---

## 7. Tech Stack (Proposed)

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Backend | FastAPI (Python) |
| AI | Claude API (question generation + explanations) |
| Database | PostgreSQL (users, sessions, scores) |
| File Storage | AWS S3 or Supabase Storage (uploaded notes) |
| Auth | Supabase Auth or Clerk |
| Hosting | Vercel (frontend) + Railway/Render (backend) |

---

## 8. Success Metrics

| Metric | Target (3 months post-launch) |
|---|---|
| Registered users | 500+ |
| Notes uploaded | 1,000+ |
| Quiz sessions completed | 5,000+ |
| Avg sessions per user per week | 3+ |
| User retention (Day 7) | > 40% |
| Question generation accuracy | > 85% user rating |

---

## 9. Milestones

| Phase | Deliverable | Timeline |
|---|---|---|
| Phase 1 | Auth + notes upload + AI question generation | Week 1–2 |
| Phase 2 | MCQ quiz mode + instant feedback | Week 3 |
| Phase 3 | Mock/timed exam mode + score report | Week 4 |
| Phase 4 | Progress dashboard + weak topic analysis | Week 5–6 |
| Phase 5 | Polish, testing, and launch | Week 7–8 |

---

## 10. Decisions

1. **Note storage:** Notes expire after **30 days** from upload date.
2. **Max file size:** **1 GB** per upload.
3. **Language:** **English only** for MVP.
4. **Questions per upload:** **Configurable** — user sets how many questions to generate.
5. **Sharing:** Question sets are **private** — no sharing with classmates in MVP.
