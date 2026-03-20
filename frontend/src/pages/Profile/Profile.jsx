import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import api from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import FadeIn from '../../components/common/FadeIn'

const PLAN_META = {
  free: {
    label: 'Free Trial',
    badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    gradientFrom: 'from-gray-400',
    gradientTo: 'to-gray-500',
    ringColor: 'ring-gray-200 dark:ring-gray-700',
    perks: ['3 note uploads', 'MCQ quiz & mock exam', 'Basic score tracking'],
    cta: true,
  },
  pro: {
    label: 'Pro',
    badge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-purple-600',
    ringColor: 'ring-indigo-300 dark:ring-indigo-700',
    perks: ['Unlimited uploads', 'Full analytics dashboard', 'Violations detection', 'Detailed answer review'],
    cta: false,
  },
  school: {
    label: 'School',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    ringColor: 'ring-purple-300 dark:ring-purple-700',
    perks: ['Everything in Pro', 'Up to 30 student seats', 'Teacher dashboard', 'Shared note library'],
    cta: false,
  },
}

function FieldRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{value}</p>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()

  const goToPricing = () => navigate('/plans')
  const [stats, setStats] = useState({ total_notes: 0, total_sessions: 0, avg_score: null })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', grade: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) setForm({ name: user.name || '', grade: user.grade || '' })
  }, [user])

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.patch('/auth/profile', { name: form.name, grade: form.grade ? parseInt(form.grade) : null })
      setUser(res.data)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      // fail silently
    } finally {
      setSaving(false)
    }
  }

  const plan = user?.plan || 'free'
  const meta = PLAN_META[plan] || PLAN_META.free
  const scoreColor = stats.avg_score >= 80 ? 'text-green-500' : stats.avg_score >= 50 ? 'text-yellow-500' : 'text-red-500'

  return (
    <AppLayout title="My Profile" subtitle="Your account and subscription">
      <div className="max-w-2xl space-y-5">

        {success && (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-2xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Profile updated successfully!
          </div>
        )}

        {/* Hero card — avatar + name + plan badge */}
        <FadeIn>
          <div className={`bg-gradient-to-br ${meta.gradientFrom} ${meta.gradientTo} rounded-3xl shadow-md px-7 py-7 flex items-center gap-5`}>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur shrink-0 flex items-center justify-center text-white text-2xl font-extrabold ring-4 ring-white/30">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold text-white truncate">{user?.name}</h2>
              <p className="text-sm text-white/70 truncate mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
                  {meta.label} Plan
                </span>
                {user?.grade && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Grade {user.grade}
                  </span>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats row */}
        <FadeIn delay={80}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Notes', value: stats.total_notes, color: 'text-indigo-600', icon: (
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )},
              { label: 'Sessions', value: stats.total_sessions, color: 'text-purple-600', icon: (
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )},
              { label: 'Avg Score', value: stats.avg_score !== null ? `${Math.round(stats.avg_score)}%` : '—', color: stats.avg_score !== null ? scoreColor : 'text-gray-400', icon: (
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )},
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-4 flex items-center gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-xl shrink-0">{s.icon}</div>
                <div>
                  <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Plan card */}
        <FadeIn delay={130}>
          <div
            onClick={goToPricing}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 group"
          >
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${meta.gradientFrom} ${meta.gradientTo} px-6 py-4 flex items-center justify-between`}>
              <div>
                <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-0.5">Current Plan</p>
                <p className="text-lg font-extrabold text-white">{meta.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/80 group-hover:text-white transition">
                  {meta.cta ? 'See all plans →' : 'Compare plans →'}
                </span>
                <div className="bg-white/20 rounded-xl px-3 py-1.5">
                  {meta.cta ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Perks */}
            <div className="px-6 py-4">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">What's included</p>
              <div className="grid grid-cols-2 gap-2">
                {meta.perks.map(perk => (
                  <div key={perk} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {perk}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Click to view and compare all plans
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Account details */}
        <FadeIn delay={180}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest">Account Details</h3>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Grade</label>
                  <select
                    value={form.grade}
                    onChange={e => setForm({ ...form, grade: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  >
                    <option value="">Select grade</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 text-sm"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-2">
                <FieldRow
                  label="Full Name"
                  value={user?.name}
                  icon={
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <FieldRow
                  label="Email"
                  value={user?.email}
                  icon={
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <FieldRow
                  label="Grade"
                  value={user?.grade ? `Grade ${user.grade}` : 'Not set'}
                  icon={
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  }
                />
                <div className="flex items-center gap-4 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Plan</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>{meta.label}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

      </div>
    </AppLayout>
  )
}
