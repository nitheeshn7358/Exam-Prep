import { Link, useLocation, useNavigate } from 'react-router-dom'
import useSessionStore from '../../store/sessionStore'

// color tokens for dark sidebar background
const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    color: {
      activeBg:   'bg-blue-500/20',
      activeText: 'text-blue-300',
      iconBg:     'bg-blue-500/25',
      iconColor:  'text-blue-300',
      dot:        'bg-blue-400',
    },
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'My Notes',
    to: '/notes',
    color: {
      activeBg:   'bg-emerald-500/20',
      activeText: 'text-emerald-300',
      iconBg:     'bg-emerald-500/25',
      iconColor:  'text-emerald-300',
      dot:        'bg-emerald-400',
    },
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Test History',
    to: '/practice',
    color: {
      activeBg:   'bg-orange-500/20',
      activeText: 'text-orange-300',
      iconBg:     'bg-orange-500/25',
      iconColor:  'text-orange-300',
      dot:        'bg-orange-400',
    },
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    to: '/analytics',
    color: {
      activeBg:   'bg-violet-500/20',
      activeText: 'text-violet-300',
      iconBg:     'bg-violet-500/25',
      iconColor:  'text-violet-300',
      dot:        'bg-violet-400',
    },
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Subjects',
    to: '/subjects',
    color: {
      activeBg:   'bg-rose-500/20',
      activeText: 'text-rose-300',
      iconBg:     'bg-rose-500/25',
      iconColor:  'text-rose-300',
      dot:        'bg-rose-400',
    },
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
]

function CircularProgress({ percent, size = 44 }) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={5} className="text-blue-100 dark:text-blue-900/40" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="currentColor" strokeWidth={5}
        className="text-blue-500"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { activeSession, clearSession } = useSessionStore()

  return (
    <aside className="w-60 min-h-screen bg-slate-800 dark:bg-slate-900 flex flex-col shrink-0">

      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-sm font-bold text-white tracking-wide">
          ExamPrep
        </span>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Menu</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-colors duration-150"
          >
            <span className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors duration-150">
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}

        {/* Divider */}
        <div className="pt-3 pb-1">
          <div className="h-px bg-white/10" />
        </div>

        {/* Upload button */}
        <Link
          to="/upload"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-300 transition-all duration-150 group
            ${location.pathname === '/upload' ? 'bg-blue-500/20' : 'hover:bg-blue-500/15'}`}
        >
          <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors shrink-0">
            <svg className="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          New Upload
        </Link>
      </nav>

      {/* Active session progress */}
      {activeSession && !location.pathname.startsWith('/quiz') && !location.pathname.startsWith('/exam') && (
        <div className="mx-3 mb-3 bg-blue-500/15 border border-blue-500/25 rounded-2xl p-3">
          <p className="text-xs font-semibold text-blue-300 mb-2">
            {activeSession.mode === 'quiz' ? '📝 Quiz in Progress' : '⏱ Exam in Progress'}
          </p>
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <CircularProgress
                percent={Math.round((activeSession.current / activeSession.total) * 100)}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-300">
                {Math.round((activeSession.current / activeSession.total) * 100)}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium">
                {activeSession.current} / {activeSession.total} done
              </p>
              <button
                onClick={() => navigate(activeSession.subjectId ? `/${activeSession.mode}/subject/${activeSession.subjectId}` : `/${activeSession.mode}/${activeSession.noteId}`)}
                className="text-xs text-blue-300 font-semibold hover:underline mt-0.5"
              >
                Resume →
              </button>
            </div>
            <button
              onClick={clearSession}
              className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
              title="Discard session"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </aside>
  )
}
