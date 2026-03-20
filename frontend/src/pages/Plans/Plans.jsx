import { Link } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import AppLayout from '../../components/layout/AppLayout'
import FadeIn from '../../components/common/FadeIn'
import api from '../../api/api'

const plans = [
  {
    key: 'free',
    label: 'Free Trial',
    price: '$0',
    period: '/ 7 days',
    gradient: 'from-gray-400 to-gray-500',
    badgeBg: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    ctaStyle: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400',
    ctaLabel: 'Current free plan',
    desc: 'Try ExamPrep with no commitment.',
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '$5',
    period: '/ month',
    gradient: 'from-indigo-500 to-purple-600',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    popular: true,
    ctaStyle: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md',
    ctaLabel: 'Upgrade to Pro',
    desc: 'Everything you need to crush every exam.',
  },
  {
    key: 'school',
    label: 'School',
    price: '$49',
    period: '/ month',
    gradient: 'from-purple-500 to-pink-500',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    ctaStyle: 'border-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    ctaLabel: 'Contact us',
    desc: 'For classrooms and tutoring centres.',
  },
]

const featureRows = [
  { feature: 'Note uploads',               free: '3 uploads',  pro: 'Unlimited',   school: 'Unlimited' },
  { feature: 'Storage',                    free: '5 GB',       pro: '50 GB',       school: '500 GB' },
  { feature: 'AI question generation',     free: true,         pro: true,          school: true },
  { feature: 'MCQ quiz mode',              free: true,         pro: true,          school: true },
  { feature: 'Mock exam with timer',       free: true,         pro: true,          school: true },
  { feature: 'Subjects & chapter pooling', free: false,        pro: true,          school: true },
  { feature: 'Violations detection',       free: false,        pro: true,          school: true },
  { feature: 'Score analytics',            free: 'Basic',      pro: 'Full',        school: 'Full' },
  { feature: 'Performance by subject',     free: false,        pro: true,          school: true },
  { feature: 'Test history & review',      free: false,        pro: true,          school: true },
  { feature: 'Priority AI processing',     free: false,        pro: true,          school: true },
  { feature: 'Student seats',              free: '1',          pro: '1',           school: 'Up to 30' },
  { feature: 'Teacher dashboard',          free: false,        pro: false,         school: true },
  { feature: 'Shared note library',        free: false,        pro: false,         school: true },
  { feature: 'Dedicated support',          free: false,        pro: false,         school: true },
]

function Tick() {
  return (
    <span className="inline-flex w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
      <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

function Cross() {
  return (
    <span className="inline-flex w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
      <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  )
}

function Label({ text, highlight }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${highlight ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
      {text}
    </span>
  )
}

function CellValue({ val, highlight }) {
  if (val === true) return <Tick />
  if (val === false) return <Cross />
  return <Label text={val} highlight={highlight} />
}

export default function Plans() {
  const { user } = useAuthStore()
  const currentPlan = user?.plan || 'free'
  const [loadingPlan, setLoadingPlan] = useState(null)

  async function handleUpgrade(planKey) {
    setLoadingPlan(planKey)
    try {
      const { data } = await api.post('/payments/create-checkout-session', {
        plan: planKey,
        interval: 'monthly',
      })
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Could not start checkout. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <AppLayout title="Plans & Pricing" subtitle="Compare plans and see what's right for you">
      <div className="max-w-4xl space-y-8">

        {/* Plan cards */}
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map(p => {
              const isCurrent = currentPlan === p.key
              return (
                <div
                  key={p.key}
                  className={`relative rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${isCurrent ? 'ring-2 ring-indigo-400 dark:ring-indigo-500 shadow-lg' : 'shadow-sm border border-gray-100 dark:border-gray-800'}`}
                >
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-br ${p.gradient} px-6 pt-6 pb-8 relative overflow-hidden`}>
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white`}>{p.label}</span>
                      {p.popular && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-yellow-400 text-yellow-900">Most Popular</span>
                      )}
                      {isCurrent && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/30 text-white">✓ Your Plan</span>
                      )}
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold text-white">{p.price}</span>
                      <span className="text-white/70 text-sm mb-1">{p.period}</span>
                    </div>
                    <p className="text-sm text-white/80 mt-1">{p.desc}</p>
                  </div>

                  {/* Body */}
                  <div className="bg-white dark:bg-gray-900 flex-1 px-6 py-5 flex flex-col">
                    <ul className="space-y-2.5 flex-1 mb-5">
                      {featureRows.filter(r => r[p.key] !== false).map(r => (
                        <li key={r.feature} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                          <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          {typeof r[p.key] === 'string' ? `${r.feature}: ${r[p.key]}` : r.feature}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <div className="w-full text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 py-2.5 rounded-xl">
                        ✓ Your current plan
                      </div>
                    ) : p.key === 'school' ? (
                      <a
                        href="mailto:hello@examprep.ai"
                        className={`block w-full text-center text-sm font-bold py-2.5 rounded-xl transition ${p.ctaStyle}`}
                      >
                        {p.ctaLabel}
                      </a>
                    ) : p.key === 'free' ? (
                      <Link
                        to="/signup"
                        className={`block w-full text-center text-sm font-bold py-2.5 rounded-xl transition ${p.ctaStyle}`}
                      >
                        {p.ctaLabel}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(p.key)}
                        disabled={loadingPlan === p.key}
                        className={`block w-full text-center text-sm font-bold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed ${p.ctaStyle}`}
                      >
                        {loadingPlan === p.key ? 'Redirecting…' : p.ctaLabel}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </FadeIn>

        {/* Feature comparison table */}
        <FadeIn delay={100}>
          <div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Feature Comparison</p>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-50 mb-5">See exactly what you get</h2>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                <div className="px-5 py-3.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Feature</div>
                {plans.map(p => (
                  <div key={p.key} className={`px-5 py-3.5 text-center ${p.key === 'pro' ? 'bg-indigo-600' : ''}`}>
                    <p className={`text-sm font-bold ${p.key === 'pro' ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>{p.label}</p>
                    <p className={`text-xs mt-0.5 ${p.key === 'pro' ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>{p.price}{p.period}</p>
                    {currentPlan === p.key && (
                      <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${p.key === 'pro' ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                        Your plan
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {featureRows.map((row, i) => (
                <div key={row.feature} className={`grid grid-cols-4 border-b border-gray-50 dark:border-gray-800/60 last:border-0 ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/40 dark:bg-gray-800/20'}`}>
                  <div className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center">{row.feature}</div>
                  <div className="px-5 py-3 flex items-center justify-center"><CellValue val={row.free} /></div>
                  <div className="px-5 py-3 flex items-center justify-center bg-indigo-50/50 dark:bg-indigo-900/10"><CellValue val={row.pro} highlight /></div>
                  <div className="px-5 py-3 flex items-center justify-center"><CellValue val={row.school} /></div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
              All plans include a 7-day free trial · Prices in USD · Cancel anytime
            </p>
          </div>
        </FadeIn>

      </div>
    </AppLayout>
  )
}
