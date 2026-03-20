import { Link } from 'react-router-dom'

const PLAN_PERKS = {
  pro: [
    'Unlimited note uploads · 50 GB storage',
    'Subjects — pool chapters into one exam',
    'Violations detection in exams',
    'Full analytics dashboard',
    'Performance by subject breakdown',
    'Detailed test history & review',
    'Priority AI processing',
  ],
  school: [
    'Everything in Pro',
    'Up to 30 student seats',
    'Teacher dashboard & insights',
    'Shared note library',
    'Dedicated support',
  ],
}

/**
 * UpgradeModal
 *
 * Props:
 *   open        – boolean
 *   onClose     – () => void
 *   feature     – string  e.g. "Detailed answer review"
 *   requiredPlan – 'pro' | 'school'  (defaults to 'pro')
 */
export default function UpgradeModal({ open, onClose, feature, requiredPlan = 'pro' }) {
  if (!open) return null

  const perks = PLAN_PERKS[requiredPlan]
  const planLabel = requiredPlan === 'school' ? 'School' : 'Pro'
  const planPrice = requiredPlan === 'school' ? '$49/mo' : '$5/mo'
  const planColor = requiredPlan === 'school' ? 'from-purple-600 to-pink-500' : 'from-indigo-600 to-purple-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-[modalPop_0.2s_ease-out] border border-transparent dark:border-gray-800">
        {/* Top gradient band */}
        <div className={`bg-gradient-to-r ${planColor} px-6 pt-8 pb-10 text-white text-center relative overflow-hidden`}>
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

          {/* Lock icon */}
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-xl font-extrabold mb-1">
            {planLabel} Feature
          </h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
            <span className="font-semibold text-white">{feature}</span> is available on the{' '}
            <span className="font-semibold text-yellow-300">{planLabel} plan</span>.
            Upgrade to unlock it.
          </p>
        </div>

        {/* Perks list */}
        <div className="px-6 py-5">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            What you get with {planLabel}
          </p>
          <ul className="space-y-2 mb-5">
            {perks.map(perk => (
              <li key={perk} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {perk}
              </li>
            ))}
          </ul>

          {/* Price */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 mb-4">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Starting at</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{planPrice}</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">Cancel anytime</span>
          </div>

          {/* CTA */}
          <Link
            to="/pricing"
            onClick={onClose}
            className={`block w-full text-center bg-gradient-to-r ${planColor} text-white font-bold py-3 rounded-2xl hover:opacity-90 transition shadow-md text-sm`}
          >
            Upgrade to {planLabel} — {planPrice}
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-center text-gray-400 dark:text-gray-500 text-sm mt-3 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
