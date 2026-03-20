import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/api'
import useSessionStore from '../../store/sessionStore'
import useTabGuard from '../../hooks/useTabGuard'
import TabWarningModal from '../../components/common/TabWarningModal'

const EXAM_MINUTES = 30

export default function Exam() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const { startSession, updateProgress, clearSession } = useSessionStore()

  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(EXAM_MINUTES * 60)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const timerRef = useRef(null)
  const autoViolations = useRef(0)

  useEffect(() => {
    api.get(`/questions/${noteId}`)
      .then((res) => {
        const shuffled = [...res.data].sort(() => Math.random() - 0.5)
        setQuestions(shuffled)
        setLoading(false)
        startSession(parseInt(noteId), '', 'exam', shuffled.length)
      })
      .catch(() => {
        setError('Failed to load questions.')
        setLoading(false)
      })
  }, [noteId])

  // Countdown timer
  useEffect(() => {
    if (loading || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [loading, submitted])

  const handleSelect = (index, option) => {
    if (submitted) return
    const newAnswers = { ...answers, [index]: option }
    setAnswers(newAnswers)
    updateProgress(Object.keys(newAnswers).length, newAnswers)
  }

  const handleSubmit = (autoSubmit = false) => {
    if (!autoSubmit && !confirm('Submit the exam? You cannot change answers after this.')) return
    clearInterval(timerRef.current)
    clearSession()
    setSubmitted(true)

    const resultAnswers = questions.map((q, i) => ({
      questionId: q.id,
      question: q.question,
      selected: answers[i] || null,
      correct: q.correct_answer,
      isCorrect: answers[i] === q.correct_answer,
      explanation: q.explanation,
    }))

    navigate('/results', {
      state: {
        answers: resultAnswers,
        total: questions.length,
        mode: 'exam',
        noteId: parseInt(noteId),
        autoSubmitted: autoViolations.current > 0,
        violations: autoViolations.current || violations,
      }
    })
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleAutoSubmit = useCallback((violationCount) => {
    autoViolations.current = violationCount
    handleSubmit(true)
  }, [answers, questions, noteId])

  const { violations, warningVisible, warningMessage, dismissWarning } = useTabGuard({
    onAutoSubmit: handleAutoSubmit,
    enabled: !loading && !submitted && questions.length > 0,
  })

  const answered = Object.keys(answers).length
  const timerWarning = timeLeft <= 300 // last 5 mins

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">Loading exam...</div>
  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-red-500">{error}</div>
  if (!questions.length) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">No questions found.</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TabWarningModal
        visible={warningVisible}
        message={warningMessage}
        violations={violations}
        onDismiss={dismissWarning}
      />
      {/* Sticky header with timer */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2 text-indigo-700">
          <div className="bg-indigo-100 p-2.5 rounded-xl">
            <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-normal tracking-wide">ExamPrep</span>
        </Link>

        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">{answered}/{questions.length} answered</span>

          {/* Timer */}
          <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-1.5 rounded-xl ${timerWarning ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => handleSubmit(false)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition"
          >
            Submit Exam
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">

        <div className="mb-2">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Mock Exam</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Answer all questions. You can review and change answers before submitting.</p>
        </div>

        {/* All questions */}
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm px-6 py-5 ${answers[i] ? 'border-indigo-200 dark:border-indigo-800' : 'border-gray-100 dark:border-gray-800'}`}
          >
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
              <span className="text-indigo-500 mr-2">Q{i + 1}.</span>{q.question}
            </p>
            <div className="space-y-2">
              {Object.entries(q.options).map(([opt, text]) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(i, opt)}
                  className={`w-full text-left flex items-start gap-3 border-2 rounded-xl px-4 py-2.5 transition-all text-sm
                    ${answers[i] === opt
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 font-medium'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 cursor-pointer dark:text-gray-300'
                    }`}
                >
                  <span className="font-bold min-w-[18px]">{opt}.</span>
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom submit */}
        <div className="pt-4 pb-10">
          <button
            onClick={() => handleSubmit(false)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition shadow-sm"
          >
            Submit Exam ({answered}/{questions.length} answered)
          </button>
          {answered < questions.length && (
            <p className="text-center text-xs text-gray-400 mt-2">
              {questions.length - answered} question{questions.length - answered > 1 ? 's' : ''} unanswered — you can still submit
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
