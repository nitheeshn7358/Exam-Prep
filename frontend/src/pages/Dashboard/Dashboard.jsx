import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import api from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import FadeIn from '../../components/common/FadeIn'

function StatCard({ to, icon, label, value, color }) {
  const colors = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      icon: 'text-blue-600 dark:text-blue-400',
      hover: 'hover:border-blue-200 dark:hover:border-blue-500/30',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      icon: 'text-orange-600 dark:text-orange-400',
      hover: 'hover:border-orange-200 dark:hover:border-orange-500/30',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      icon: 'text-emerald-600 dark:text-emerald-400',
      hover: 'hover:border-emerald-200 dark:hover:border-emerald-500/30',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      icon: 'text-rose-600 dark:text-rose-400',
      hover: 'hover:border-rose-200 dark:hover:border-rose-500/30',
    },
  }
  const c = colors[color] || colors.blue

  return (
    <Link
      to={to}
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm px-6 py-5 flex items-center gap-4 transition-all duration-200 ${c.hover} hover:shadow-md`}
    >
      <div className={`${c.bg} p-3 rounded-xl`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [stats, setStats] = useState({ total_notes: 0, total_sessions: 0, avg_score: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      if (!user) {
        try {
          const res = await api.get('/auth/me')
          setUser(res.data)
        } catch {
          logout()
          navigate('/login')
          return
        }
      }
    }

    async function loadNotes() {
      try {
        const res = await api.get('/notes')
        setNotes(res.data)
      } catch {
        setNotes([])
      }
    }

    async function loadStats() {
      try {
        const res = await api.get('/dashboard/stats')
        setStats(res.data)
      } catch {}
    }

    async function init() {
      await loadUser()
      await Promise.all([loadNotes(), loadStats()])
      setLoading(false)
    }

    init()
  }, [])

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note and all its questions?')) return
    try {
      await api.delete(`/notes/${noteId}`)
      setNotes(notes.filter((n) => n.id !== noteId))
    } catch {
      alert('Failed to delete note.')
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'Student'

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-8">

        {/* Header */}
        <FadeIn>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Good day, {firstName} 👋
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Here's what's on your study plate today.
              </p>
            </div>
            <Link
              to="/upload"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Upload Notes
            </Link>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={80}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              to="/notes"
              color="blue"
              label="Notes"
              value={stats.total_notes}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <StatCard
              to="/practice"
              color="orange"
              label="Sessions"
              value={stats.total_sessions}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatCard
              to="/analytics"
              color="emerald"
              label="Avg Score"
              value={stats.avg_score !== null ? `${Math.round(stats.avg_score)}%` : '—'}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <StatCard
              to="/subjects"
              color="rose"
              label="Subjects"
              value="—"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
            />
          </div>
        </FadeIn>

        {/* Notes list */}
        <FadeIn delay={160}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">My Notes</h2>
              {notes.length > 0 && (
                <Link to="/notes" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  View all →
                </Link>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-600 text-sm">Loading...</div>
            ) : notes.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-blue-400 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">No notes yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-5 max-w-xs">
                  Upload your study notes and we'll generate practice questions for you.
                </p>
                <Link
                  to="/upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
                >
                  Upload your first note
                </Link>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {notes.map((note, index) => (
                  <div
                    key={note.id}
                    className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                      index !== 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-4.5 h-4.5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{note.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {note.question_count ?? 0} questions · Expires {new Date(note.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Link
                        to={`/quiz/${note.id}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg px-3 py-1.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        MCQ Quiz
                      </Link>
                      <Link
                        to={`/exam/${note.id}`}
                        className="text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-lg px-3 py-1.5 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors"
                      >
                        Mock Exam
                      </Link>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 transition-colors px-1.5 py-1.5"
                        title="Delete note"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

      </div>
    </AppLayout>
  )
}
