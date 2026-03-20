import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts'
import api from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import FadeIn from '../../components/common/FadeIn'
import UpgradeModal from '../../components/common/UpgradeModal'
import usePlan from '../../hooks/usePlan'

const COLORS = { quiz: '#6366f1', exam: '#a855f7' }
const DIST_COLORS = { '0-49': '#ef4444', '50-79': '#f59e0b', '80-100': '#22c55e' }

function StatCard({ label, value, sub, color = 'text-gray-800 dark:text-gray-100', icon }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-5 flex items-center gap-4">
      {icon && <div className="shrink-0">{icon}</div>}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-2xl font-extrabold ${color}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">{children}</h2>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl px-4 py-3 text-xs pointer-events-none">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}{p.name === 'score' ? '%' : ''}</span></p>
      ))}
    </div>
  )
}

function LockedChart({ feature, onUpgrade }) {
  return (
    <div
      className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden cursor-pointer group"
      onClick={onUpgrade}
    >
      {/* blurred fake chart bg */}
      <div className="h-52 flex items-end gap-2 px-6 pb-4 pt-6 blur-sm pointer-events-none select-none opacity-40">
        {[40, 65, 50, 80, 70, 90, 60].map((h, i) => (
          <div key={i} className="flex-1 bg-indigo-200 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{feature}</p>
        <p className="text-xs text-gray-400 mt-1">Available on Pro plan</p>
        <span className="mt-3 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl group-hover:bg-indigo-100 transition">
          Upgrade to unlock →
        </span>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgradeModal, setUpgradeModal] = useState({ open: false, feature: '' })
  const { can } = usePlan()

  const openUpgrade = (feature) => setUpgradeModal({ open: true, feature })

  useEffect(() => {
    api.get('/analytics')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AppLayout title="Analytics" subtitle="Your study performance at a glance">
      <div className="text-center py-20 text-gray-400">Loading analytics...</div>
    </AppLayout>
  )

  if (!data || data.summary.total_sessions === 0) return (
    <AppLayout title="Analytics" subtitle="Your study performance at a glance">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl mb-4">
          <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">No data yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Take a quiz or exam to see your analytics here</p>
      </div>
    </AppLayout>
  )

  const { summary, score_trend, mode_breakdown, score_distribution, by_note, violations_summary } = data

  const pieData = [
    { name: 'MCQ Quiz', value: mode_breakdown.quiz, color: COLORS.quiz },
    { name: 'Mock Exam', value: mode_breakdown.exam, color: COLORS.exam },
  ].filter(d => d.value > 0)

  const distData = Object.entries(score_distribution).map(([range, count]) => ({
    name: range, count, color: DIST_COLORS[range],
  }))

  const violData = [
    { name: 'Clean', value: violations_summary.clean, color: '#22c55e' },
    { name: 'Warning', value: violations_summary.warned, color: '#f59e0b' },
    { name: 'Terminated', value: violations_summary.terminated, color: '#ef4444' },
  ].filter(d => d.value > 0)

  const accuracy = summary.total_questions > 0
    ? Math.round((summary.total_correct / summary.total_questions) * 100)
    : null

  return (
    <AppLayout title="Analytics" subtitle="Your study performance at a glance">
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, feature: '' })}
        feature={upgradeModal.feature}
        requiredPlan="pro"
      />
      <div className="space-y-8 max-w-5xl">

        {/* Summary stats */}
        <FadeIn>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Total Sessions"
              value={summary.total_sessions}
              color="text-indigo-600"
              icon={
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              }
            />
            <StatCard
              label="Average Score"
              value={summary.avg_score != null ? `${summary.avg_score}%` : null}
              color={summary.avg_score >= 80 ? 'text-green-600' : summary.avg_score >= 50 ? 'text-yellow-500' : 'text-red-500'}
              icon={
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2.5 rounded-xl">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                  </svg>
                </div>
              }
            />
            <StatCard
              label="Best Score"
              value={summary.best_score != null ? `${summary.best_score}%` : null}
              color="text-green-600"
              icon={
                <div className="bg-green-50 dark:bg-green-900/30 p-2.5 rounded-xl">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
              }
            />
            <StatCard
              label="Questions Answered"
              value={summary.total_questions}
              sub={`${summary.total_correct} correct`}
              icon={
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            />
            <StatCard
              label="Accuracy Rate"
              value={accuracy != null ? `${accuracy}%` : null}
              color={accuracy >= 80 ? 'text-green-600' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}
              icon={
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2.5 rounded-xl">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            />
            <StatCard
              label="Total Violations"
              value={summary.total_violations}
              color={summary.total_violations === 0 ? 'text-green-600' : summary.total_violations <= 2 ? 'text-yellow-500' : 'text-red-500'}
              sub={summary.total_violations === 0 ? 'Perfect integrity' : 'Tab switches detected'}
              icon={
                <div className={`p-2.5 rounded-xl ${summary.total_violations === 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                  <svg className={`w-5 h-5 ${summary.total_violations === 0 ? 'text-green-500' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              }
            />
          </div>
        </FadeIn>

        {/* Score trend */}
        {score_trend.length > 1 && (
          <FadeIn delay={100}>
            <SectionTitle>Score Trend</SectionTitle>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={score_trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} style={{ cursor: 'default' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} animationDuration={0} offset={12} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Line
                    type="monotone" dataKey="score" name="score"
                    stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6, style: { cursor: 'default' } }} isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>
        )}

        {/* Mode breakdown + Score distribution side by side */}
        <FadeIn delay={150}>
          <div className="grid grid-cols-2 gap-4">

            {/* Quiz vs Exam pie */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5">
              <SectionTitle>Quiz vs Exam</SectionTitle>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart style={{ cursor: 'default' }}>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} isAnimationActive={false} stroke="transparent" style={{ cursor: 'default' }}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} style={{ cursor: 'default' }} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-500 dark:text-gray-400">{v}</span>} />
                    <Tooltip formatter={(v, n) => [`${v} sessions`, n]} animationDuration={0} offset={12} cursor={false} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 text-center py-8">No data</p>}
            </div>

            {/* Score distribution bar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5">
              <SectionTitle>Score Distribution</SectionTitle>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={distData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} style={{ cursor: 'default' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v} sessions`, 'Count']} animationDuration={0} offset={12} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={false} activeBar={{ stroke: 'none', filter: 'brightness(1.15) drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }}>
                    {distData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FadeIn>

        {/* Performance by subject */}
        {by_note.length > 0 && (
          <FadeIn delay={200}>
            <SectionTitle>Performance by Subject</SectionTitle>
            {can('performanceBySubject') ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5">
                <ResponsiveContainer width="100%" height={Math.max(180, by_note.length * 52)}>
                  <BarChart data={by_note} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }} style={{ cursor: 'default' }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis type="category" dataKey="note_title" tick={{ fontSize: 11, fill: '#6b7280' }} width={160} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} animationDuration={0} offset={12} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                    <Bar dataKey="avg_score" radius={[0, 6, 6, 0]} isAnimationActive={false} activeBar={{ stroke: 'none', filter: 'brightness(1.15) drop-shadow(0 4px 6px rgba(0,0,0,0.18))' }}>
                      {by_note.map((entry, i) => (
                        <Cell key={i} fill={entry.avg_score >= 80 ? '#22c55e' : entry.avg_score >= 50 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <LockedChart feature="Performance by Subject" onUpgrade={() => openUpgrade('Performance by Subject')} />
            )}
          </FadeIn>
        )}

        {/* Integrity / violations pie */}
        <FadeIn delay={250}>
          <SectionTitle>Session Integrity</SectionTitle>
          {can('violationsDetection') ? (
            (violations_summary.warned > 0 || violations_summary.terminated > 0) ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5">
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart style={{ cursor: 'default' }}>
                      <Pie data={violData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} isAnimationActive={false} stroke="transparent" style={{ cursor: 'default' }}>
                        {violData.map((entry, i) => <Cell key={i} fill={entry.color} style={{ cursor: 'default' }} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} sessions`, n]} animationDuration={0} offset={12} cursor={false} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 flex-1">
                    {[
                      { label: 'Clean sessions', value: violations_summary.clean, color: 'bg-green-500', text: 'text-green-600' },
                      { label: 'Sessions with warning', value: violations_summary.warned, color: 'bg-yellow-400', text: 'text-yellow-600' },
                      { label: 'Auto-terminated sessions', value: violations_summary.terminated, color: 'bg-red-500', text: 'text-red-600' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                        </div>
                        <span className={`text-sm font-bold ${item.text}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4 text-sm text-green-700 dark:text-green-400">
                All sessions were clean — no violations detected.
              </div>
            )
          ) : (
            <LockedChart feature="Session Integrity" onUpgrade={() => openUpgrade('Violations & Session Integrity')} />
          )}
        </FadeIn>

      </div>
    </AppLayout>
  )
}
