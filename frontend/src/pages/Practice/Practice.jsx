import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import FadeIn from '../../components/common/FadeIn'

export default function Practice() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/sessions')
      .then(res => setSessions(res.data))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const scoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-red-500 dark:text-red-400'
  }

  const scoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
    if (score >= 50) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800'
    return 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AppLayout title="Practice History" subtitle="All your past quiz and exam sessions">
      <div className="max-w-3xl space-y-4">

        <FadeIn>
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl mb-4">
              <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No sessions yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-5">Take a quiz or mock exam to see your history here</p>
            <Link to="/notes" className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
              Go to My Notes
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <Link
                key={s.id}
                to={`/session/${s.id}`}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-4 flex items-center justify-between hover:border-indigo-200 dark:hover:border-white hover:shadow-md transition-all duration-200 block"
              >
                <div className="flex items-center gap-4">
                  {/* Mode icon */}
                  <div className={`p-2.5 rounded-xl ${s.mode === 'exam' ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-indigo-50 dark:bg-indigo-900/30'}`}>
                    {s.mode === 'exam' ? (
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                      {s.subject_name
                        ? <><span className="text-indigo-500 text-xs font-semibold mr-1">Subject:</span>{s.subject_name}</>
                        : (s.note_title || 'Deleted Note')
                      }
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.mode === 'exam' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                        {s.mode === 'exam' ? 'Mock Exam' : 'MCQ Quiz'}
                      </span>
                      {s.violations > 0 && (
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.violations >= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {s.violations} violation{s.violations !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(s.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Score + arrow */}
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl border text-center min-w-[80px] ${scoreBg(s.score)}`}>
                    <p className={`text-xl font-extrabold ${scoreColor(s.score)}`}>{Math.round(s.score)}%</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{s.correct}/{s.total}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
        </FadeIn>
      </div>
    </AppLayout>
  )
}
