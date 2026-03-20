import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../../api/api'
import useSessionStore from '../../store/sessionStore'
import useTabGuard from '../../hooks/useTabGuard'
import TabWarningModal from '../../components/common/TabWarningModal'

export default function QuizSubject() {
  const { subjectId } = useParams()
  const [searchParams] = useSearchParams()
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 0
  const navigate = useNavigate()
  const { startSession, updateProgress, clearSession } = useSessionStore()

  const [questions, setQuestions] = useState([])
  const [subjectName, setSubjectName] = useState('')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const url = `/subjects/${subjectId}/questions${limit ? `?limit=${limit}` : ''}`
    api.get(url)
      .then((res) => {
        setQuestions(res.data.questions)
        setSubjectName(res.data.subject_name)
        setLoading(false)
        startSession(null, res.data.subject_name, 'quiz', res.data.questions.length, parseInt(subjectId))
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load questions.')
        setLoading(false)
      })
    return () => {}
  }, [subjectId])

  const handleAutoSubmit = useCallback((violationCount) => {
    clearSession()
    navigate('/results', {
      state: {
        answers,
        total: questions.length,
        mode: 'quiz',
        subjectId: parseInt(subjectId),
        autoSubmitted: true,
        violations: violationCount,
      }
    })
  }, [answers, questions, subjectId])

  const { violations, warningVisible, warningMessage, dismissWarning } = useTabGuard({
    onAutoSubmit: handleAutoSubmit,
    enabled: !loading && questions.length > 0,
  })

  const question = questions[current]
  const isLast = current === questions.length - 1
  const isCorrect = selected === question?.correct_answer

  const handleSelect = (option) => {
    if (selected) return
    setSelected(option)
    setShowExplanation(true)
  }

  const handleNext = () => {
    const newAnswer = {
      questionId: question.id,
      question: question.question,
      selected,
      correct: question.correct_answer,
      isCorrect: selected === question.correct_answer,
      explanation: question.explanation,
    }
    const newAnswers = [...answers, newAnswer]
    setAnswers(newAnswers)

    if (isLast) {
      clearSession()
      navigate('/results', {
        state: {
          answers: newAnswers,
          total: questions.length,
          mode: 'quiz',
          subjectId: parseInt(subjectId),
          violations,
        }
      })
    } else {
      const nextIndex = current + 1
      setCurrent(nextIndex)
      setSelected(null)
      setShowExplanation(false)
      updateProgress(nextIndex, newAnswers)
    }
  }

  const optionStyle = (opt) => {
    if (!selected) {
      return 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer dark:text-gray-200'
    }
    if (opt === question.correct_answer) {
      return 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
    }
    if (opt === selected && opt !== question.correct_answer) {
      return 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
    }
    return 'border-gray-200 dark:border-gray-700 opacity-50 dark:text-gray-400'
  }

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">Loading questions...</div>
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{subjectName}</span>
          <Link to={`/subjects/${subjectId}`} className="text-sm text-gray-500 hover:text-indigo-600 transition flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Exit Quiz
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{answers.filter(a => a.isCorrect).length} correct so far</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">{question.question}</p>

          <div className="space-y-3">
            {Object.entries(question.options).map(([opt, text]) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left flex items-start gap-3 border-2 rounded-xl px-4 py-3 transition-all ${optionStyle(opt)}`}
              >
                <span className="font-bold text-sm min-w-[20px] mt-0.5">{opt}.</span>
                <span className="text-sm">{text}</span>
                {selected && opt === question.correct_answer && (
                  <svg className="w-5 h-5 text-green-500 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {selected && opt === selected && opt !== question.correct_answer && (
                  <svg className="w-5 h-5 text-red-500 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation && question.explanation && (
            <div className={`mt-5 rounded-xl px-4 py-3 text-sm ${isCorrect ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <span className="font-semibold">{isCorrect ? 'Correct! ' : 'Incorrect. '}</span>
              {question.explanation}
            </div>
          )}

          {/* Next button */}
          {selected && (
            <button
              onClick={handleNext}
              className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition"
            >
              {isLast ? 'See Results' : 'Next Question →'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
