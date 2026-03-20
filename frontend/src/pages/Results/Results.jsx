import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../../api/api'

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.answers) {
    navigate('/dashboard')
    return null
  }

  const { answers, total, mode, noteId, subjectId, autoSubmitted, violations = 0 } = state
  const correct = answers.filter(a => a.isCorrect).length
  const score = Math.round((correct / total) * 100)

  const saved = useRef(false)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    api.post('/sessions', {
      note_id: noteId || null,
      subject_id: subjectId || null,
      mode,
      score,
      total,
      correct,
      violations: violations || 0,
      answers,
    }).catch(() => {})
  }, [])

  const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
  const scoreBg = score >= 80 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : score >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  const message = score >= 80 ? 'Great job! Keep it up!' : score >= 50 ? 'Good effort! Review the wrong ones.' : 'Keep practicing — you\'ve got this!'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-indigo-700">
          <div className="bg-indigo-100 p-2.5 rounded-xl">
            <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl font-normal tracking-wide">ExamPrep</span>
        </Link>
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-indigo-600 transition">
          Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Violation banner — show for any violations */}
        {violations > 0 && (
          <div className={`rounded-2xl px-5 py-6 flex flex-col items-center text-center space-y-3 border ${autoSubmitted ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className={`p-3 rounded-full ${autoSubmitted ? 'bg-red-100' : 'bg-yellow-100'}`}>
              {autoSubmitted ? (
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${autoSubmitted ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'}`}>
              {violations} violation{violations !== 1 ? 's' : ''} recorded
            </span>
            <p className={`text-sm font-bold ${autoSubmitted ? 'text-red-700' : 'text-yellow-700'}`}>
              {autoSubmitted ? 'Session Terminated — Integrity Violation' : 'Tab Switch Detected During Session'}
            </p>
            <p className={`text-sm w-full ${autoSubmitted ? 'text-red-600' : 'text-yellow-700'}`}>
              {autoSubmitted
                ? `This ${mode === 'exam' ? 'exam' : 'quiz'} was automatically submitted because you switched tabs or left the page ${violations} time${violations !== 1 ? 's' : ''} during the session. Repeated tab switching is not allowed as it compromises the integrity of your practice. Your answers up to that point have been recorded.`
                : `A tab switch was spotted during this ${mode === 'exam' ? 'exam' : 'quiz'}. While your session was completed normally, leaving the page during a test undermines the purpose of your practice. Try to stay focused throughout for accurate results.`
              }
            </p>
            <span className={`text-xs ${autoSubmitted ? 'text-red-400' : 'text-yellow-500'}`}>
              Stay focused next time — your scores reflect your true preparation.
            </span>
          </div>
        )}

        {/* Score card */}
        <div className={`bg-white dark:bg-gray-900 rounded-2xl border-2 shadow-sm px-8 py-8 text-center ${scoreBg}`}>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{mode === 'exam' ? 'Mock Exam' : 'MCQ Quiz'} Complete</p>
          <p className={`text-7xl font-extrabold ${scoreColor}`}>{score}%</p>
          <p className="text-gray-600 dark:text-gray-300 mt-3 font-medium">{correct} out of {total} correct</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link
            to="/dashboard"
            className="flex-1 text-center border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition"
          >
            Try Again
          </button>
        </div>

        {/* Answer review */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Answer Review</h2>
          <div className="space-y-4">
            {answers.map((a, i) => (
              <div key={i} className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm px-6 py-5 ${a.isCorrect ? 'border-green-100 dark:border-green-900' : 'border-red-100 dark:border-red-900'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${a.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    {a.isCorrect ? (
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{i + 1}. {a.question}</p>
                    <div className="mt-2 text-xs space-y-1">
                      {!a.isCorrect && (
                        <p className="text-red-600">Your answer: <span className="font-semibold">{a.selected}</span></p>
                      )}
                      <p className="text-green-600">Correct answer: <span className="font-semibold">{a.correct}</span></p>
                      {a.explanation && (
                        <p className="text-gray-500 mt-1">{a.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
