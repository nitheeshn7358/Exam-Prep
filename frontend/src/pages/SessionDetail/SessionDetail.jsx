import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import UpgradeModal from '../../components/common/UpgradeModal'
import usePlan from '../../hooks/usePlan'

export default function SessionDetail() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { can } = usePlan()

  useEffect(() => {
    api.get(`/sessions/${sessionId}`)
      .then(res => setSession(res.data))
      .catch(() => setError('Could not load session details.'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) return (
    <AppLayout>
      <div className="text-center py-20 text-gray-400">Loading...</div>
    </AppLayout>
  )

  if (error || !session) return (
    <AppLayout>
      <div className="text-center py-20 text-red-400">{error || 'Session not found.'}</div>
    </AppLayout>
  )

  const { mode, score, total, correct, violations, created_at, note_title, answers } = session
  const autoSubmitted = violations >= 2
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
  const scoreBg = score >= 80 ? 'bg-green-50 border-green-200' : score >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const wrongAnswers = answers.filter(a => !a.isCorrect)

  return (
    <AppLayout>
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Detailed answer review"
        requiredPlan="pro"
      />
      <div className="max-w-3xl space-y-6">

        {/* Back */}
        <Link to="/practice" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Test History
        </Link>

        {/* Header info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
              {mode === 'exam' ? 'Mock Exam' : 'MCQ Quiz'}
            </p>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">{note_title}</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(created_at)}</p>
          </div>
          <div className={`text-center px-5 py-3 rounded-xl border-2 ${scoreBg}`}>
            <p className={`text-3xl font-extrabold ${scoreColor}`}>{Math.round(score)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{correct}/{total} correct</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Questions', value: total, color: 'text-gray-800 dark:text-gray-100' },
            { label: 'Correct', value: correct, color: 'text-green-600' },
            { label: 'Wrong', value: total - correct, color: 'text-red-500' },
            { label: 'Violations', value: violations, color: violations > 0 ? (violations >= 2 ? 'text-red-600' : 'text-yellow-500') : 'text-gray-400 dark:text-gray-500', proOnly: true },
          ].map(stat => (
            <div key={stat.label} className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-4 text-center relative ${stat.proOnly && !can('violationsDetection') ? 'cursor-pointer group' : ''}`}
              onClick={stat.proOnly && !can('violationsDetection') ? () => setShowUpgrade(true) : undefined}
            >
              {stat.proOnly && !can('violationsDetection') ? (
                <>
                  <div className="text-2xl font-extrabold text-gray-200 blur-sm select-none">—</div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.label}</p>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-white/80 dark:bg-gray-900/80 rounded-2xl">
                    <span className="text-xs font-bold text-indigo-500">Pro only</span>
                  </div>
                </>
              ) : (
                <>
                  <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.label}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Violation banner */}
        {violations > 0 && can('violationsDetection') && (
          <div className={`rounded-2xl px-5 py-4 flex items-start gap-4 border ${autoSubmitted ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}`}>
            <div className={`p-2 rounded-full shrink-0 ${autoSubmitted ? 'bg-red-100 dark:bg-red-900/40' : 'bg-yellow-100 dark:bg-yellow-900/40'}`}>
              <svg className={`w-4 h-4 ${autoSubmitted ? 'text-red-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${autoSubmitted ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                {autoSubmitted ? 'Session auto-submitted due to integrity violations' : `${violations} tab switch violation${violations !== 1 ? 's' : ''} detected`}
              </p>
              <p className={`text-xs mt-0.5 ${autoSubmitted ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {autoSubmitted
                  ? 'The exam was terminated automatically after repeated tab switching.'
                  : 'Session was completed but a tab switch was spotted during the test.'}
              </p>
            </div>
          </div>
        )}

        {/* Answer review */}
        {!can('testHistoryReview') ? (
          <div
            className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden cursor-pointer group"
            onClick={() => setShowUpgrade(true)}
          >
            {/* Blurred fake rows */}
            <div className="space-y-3 p-6 blur-sm pointer-events-none select-none opacity-40">
              {[1, 2, 3].map(n => (
                <div key={n} className="rounded-xl border border-red-100 px-5 py-4 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Detailed Answer Review</p>
              <p className="text-xs text-gray-400 mt-1">See every question, your answer, and the correct answer</p>
              <span className="mt-3 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl group-hover:bg-indigo-100 transition">
                Upgrade to Pro to unlock →
              </span>
            </div>
          </div>
        ) : answers.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-10 text-center text-gray-400 text-sm">
            Detailed answer review is only available for sessions taken after this update.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">Answer Review</h2>
              <span className="text-xs text-gray-400 dark:text-gray-500">{wrongAnswers.length} mistake{wrongAnswers.length !== 1 ? 's' : ''}</span>
            </div>

            {answers.map((a, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm px-6 py-5 ${
                  a.isCorrect ? 'border-green-100 dark:border-green-900/40' : 'border-red-100 dark:border-red-900/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    a.isCorrect ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'
                  }`}>
                    {a.isCorrect ? (
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
                      <span className="text-indigo-400 mr-1.5">Q{i + 1}.</span>{a.question}
                    </p>
                    <div className="space-y-1 text-xs">
                      {!a.isCorrect && a.selected && (
                        <p className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Your answer: <span className="font-semibold">{a.selected}</span>
                        </p>
                      )}
                      {!a.isCorrect && !a.selected && (
                        <p className="text-gray-400 dark:text-gray-500 italic">Not answered</p>
                      )}
                      <p className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Correct answer: <span className="font-semibold">{a.correct}</span>
                      </p>
                      {a.explanation && (
                        <p className="text-gray-500 dark:text-gray-400 mt-2 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-2">
                          {a.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AppLayout>
  )
}
