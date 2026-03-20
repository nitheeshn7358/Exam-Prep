import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, useInView } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import confetti from 'canvas-confetti'
import { AuroraBackground } from '../../components/ui/AuroraBackground'
import { TestimonialsSection } from '../../components/ui/TestimonialsSection'
import FeatureCarousel from '../../components/ui/FeatureCarousel'
import useAuthStore from '../../store/authStore'
import api from '../../api/api'


const steps = [
  { num: '01', title: 'Upload your notes', desc: 'Drop in any PDF, Word doc, or plain text file.' },
  { num: '02', title: 'AI builds your quiz', desc: 'Questions are generated in under 30 seconds.' },
  { num: '03', title: 'Practice & improve', desc: 'Track scores, spot weak areas, repeat until ready.' },
]

const trialPerks = [
  'Unlimited uploads for 7 days',
  'AI-generated MCQs & mock exams',
  'Full score analytics dashboard',
  'No credit card required',
]

function CountUp({ end, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(end / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setVal(end); clearInterval(timer) }
      else setVal(start)
    }, 30)
    return () => clearInterval(timer)
  }, [end])
  return <>{val.toLocaleString()}{suffix}</>
}

const pricingPlans = [
  {
    name: 'Free Trial',
    price: 0,
    yearlyPrice: 0,
    period: '7 days',
    description: 'No credit card required.',
    buttonText: 'Start Free Trial',
    href: '/signup',
    planKey: 'free',
    isPopular: false,
    features: [
      'Up to 3 note uploads',
      '5 GB storage',
      'AI-generated MCQs & mock exams',
      'Basic score tracking',
    ],
  },
  {
    name: 'Pro',
    price: 5,
    yearlyPrice: 4,
    period: 'month',
    description: 'Cancel anytime · Billed monthly',
    buttonText: 'Get Pro',
    href: '/signup',
    planKey: 'pro',
    isPopular: true,
    features: [
      'Unlimited note uploads',
      '50 GB storage',
      'Subjects — pool chapters into one exam',
      'Mock exams with timer & violations',
      'Full analytics dashboard',
      'Performance by subject breakdown',
      'Priority AI processing',
    ],
  },
  {
    name: 'School',
    price: 49,
    yearlyPrice: 39,
    period: 'month',
    description: 'For classrooms and tutoring centres.',
    buttonText: 'Contact Us',
    href: 'mailto:hello@examprep.ai',
    planKey: 'school',
    isPopular: false,
    features: [
      'Up to 30 student seats',
      '500 GB storage',
      'Everything in Pro',
      'Teacher dashboard & insights',
      'Shared note library',
      'Dedicated support',
    ],
  },
]


// ─── Support Modal ────────────────────────────────────────────────────────────
function SupportModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('http://localhost:8000/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition"

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#0d1a35', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Top accent line */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), transparent)' }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-white font-bold text-base">Contact Support</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>We usually respond within 24 hours.</p>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.35)' }} className="hover:text-white transition mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === 'sent' ? (
          <div className="px-6 pb-8 pt-2 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold text-sm">Message sent!</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
              We'll get back to you at <span className="text-blue-400">{form.email}</span> shortly.
            </p>
            <button onClick={onClose} className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Your name</label>
                <input required value={form.name} onChange={set('name')} placeholder="Alex" className={inputClass} />
              </div>
              <div>
                <label className="block mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Email</label>
                <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Query</label>
              <input required value={form.subject} onChange={set('subject')} placeholder="What's this about?" className={inputClass} />
            </div>
            <div>
              <label className="block mb-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Description</label>
              <textarea required rows={4} value={form.message} onChange={set('message')} placeholder="Describe your issue or question in detail..." className={`${inputClass} resize-none`} />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-xs text-center">Something went wrong — please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 w-full py-2.5 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)' }}
            >
              {status === 'sending' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}

function StarfieldBg() {
  const stars = useMemo(() =>
    Array.from({ length: 180 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 2,
      opacity: Math.random() * 0.6 + 0.2,
    })), [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: s.opacity,
          }}
        />
      ))}
      {/* Blue nebula glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-blue-400/10 rounded-full blur-[90px]" />
    </div>
  )
}

function SpaceEffects() {
  const shootingStars = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      top: Math.random() * 55,
      left: 30 + Math.random() * 65,
      delay: Math.random() * 18,
      duration: 1.8 + Math.random() * 2,
      tailLength: 90 + Math.random() * 70,
      thickness: 1 + Math.random() * 0.8,
    })), [])

  const meteors = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      top: Math.random() * 35,
      left: 20 + Math.random() * 60,
      delay: 0.05 + Math.random() * 4,
      duration: 3.5 + Math.random() * 2.5,
      tailLength: 180 + Math.random() * 120,
      thickness: 2.5 + Math.random(),
    })), [])

  return (
    <>
      <style>{`
        @keyframes shootStar {
          0%   { transform: translate(0, 0); opacity: 0; }
          8%   { opacity: 1; }
          85%  { opacity: 0.6; }
          100% { transform: translate(-700px, 700px); opacity: 0; }
        }
        @keyframes shootMeteor {
          0%   { transform: translate(0, 0); opacity: 0; }
          6%   { opacity: 1; }
          80%  { opacity: 0.8; }
          100% { transform: translate(-900px, 900px); opacity: 0; }
        }
        @keyframes meteorGlow {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

        {/* Shooting stars */}
        {shootingStars.map(s => (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              top: `${s.top}%`,
              left: `${s.left}%`,
              opacity: 0,
              animation: `shootStar ${s.duration}s ${s.delay}s linear infinite`,
            }}
          >
            <div style={{
              width: `${s.tailLength}px`,
              height: `${s.thickness}px`,
              background: 'linear-gradient(to left, transparent, rgba(147,210,255,0.4) 40%, rgba(220,240,255,0.95))',
              borderRadius: '9999px',
              transform: 'rotate(-45deg)',
              transformOrigin: 'right center',
            }} />
            {/* Bright tip dot */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              width: `${s.thickness * 2.5}px`,
              height: `${s.thickness * 2.5}px`,
              borderRadius: '50%',
              background: 'white',
              boxShadow: '0 0 4px 2px rgba(180,220,255,0.8)',
            }} />
          </div>
        ))}

        {/* Meteors — bigger, glowing */}
        {meteors.map(m => (
          <div
            key={m.id}
            style={{
              position: 'absolute',
              top: `${m.top}%`,
              left: `${m.left}%`,
              opacity: 0,
              animation: `shootMeteor ${m.duration}s ${m.delay}s linear infinite`,
            }}
          >
            {/* Tail */}
            <div style={{
              width: `${m.tailLength}px`,
              height: `${m.thickness}px`,
              background: 'linear-gradient(to left, transparent, rgba(100,180,255,0.2) 30%, rgba(150,210,255,0.7) 70%, rgba(220,240,255,0.95))',
              borderRadius: '9999px',
              transform: 'rotate(-45deg)',
              transformOrigin: 'right center',
            }} />
            {/* Glow halo around tail */}
            <div style={{
              position: 'absolute',
              top: '50%',
              right: `${m.tailLength * 0.1}px`,
              transform: 'translateY(-50%) rotate(-45deg)',
              width: `${m.tailLength * 0.5}px`,
              height: `${m.thickness * 6}px`,
              background: 'linear-gradient(to left, transparent, rgba(100,180,255,0.08))',
              borderRadius: '9999px',
              filter: 'blur(3px)',
            }} />
            {/* Bright head */}
            <div style={{
              position: 'absolute',
              left: '-2px',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${m.thickness * 3.5}px`,
              height: `${m.thickness * 3.5}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, white 30%, rgba(150,210,255,0.8) 70%, transparent)',
              boxShadow: `0 0 ${m.thickness * 4}px ${m.thickness * 2}px rgba(100,180,255,0.6), 0 0 ${m.thickness * 8}px ${m.thickness * 3}px rgba(60,140,255,0.3)`,
              animation: `meteorGlow ${m.duration * 0.4}s ease-in-out infinite`,
            }} />
          </div>
        ))}

      </div>
    </>
  )
}

function PricingCard({ plan, index, isMonthly }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const restY    = index === 1 ? -20 : 0
  const restX    = index === 0 ? 15 : index === 2 ? -15 : 0
  const restScale = index === 0 || index === 2 ? 0.94 : 1
  const restRotY  = index === 0 ? 8 : index === 2 ? -8 : 0
  const origin    = index === 0 ? 'right center' : index === 2 ? 'left center' : 'center'

  async function handleCheckout() {
    if (!token) {
      // Not logged in — send to signup with intent to pay after
      navigate(`/signup?plan=${plan.planKey}&interval=${isMonthly ? 'monthly' : 'yearly'}`)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/payments/create-checkout-session', {
        plan: plan.planKey,
        interval: isMonthly ? 'monthly' : 'yearly',
      })
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Could not start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView
        ? { opacity: 1, y: restY, x: restX, scale: restScale, rotateY: restRotY }
        : { opacity: 0, y: 60 }
      }
      transition={{ duration: 0.7, type: 'spring', stiffness: 80, damping: 22, delay: index * 0.12 }}
      whileHover={{
        y: index === 1 ? restY - 18 : restY - 12,
        x: restX,
        scale: index === 1 ? 1.04 : 1.02,
        rotateY: index === 0 ? restRotY - 12 : index === 2 ? restRotY + 12 : 0,
        rotateX: -6,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      style={{ transformStyle: 'preserve-3d', transformOrigin: origin }}
      className={`relative rounded-2xl border p-6 flex flex-col ${
        plan.isPopular
          ? 'bg-[#0d2248] border-blue-400 border-2 shadow-2xl shadow-blue-500/20 z-10'
          : 'bg-[#0a1628]/80 border-white/10 z-0'
      } ${!plan.isPopular ? 'mt-5 lg:mt-0' : ''}`}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute top-0 right-0 bg-indigo-600 py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-white text-xs font-bold">Popular</span>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <p className={`text-sm font-semibold mb-5 ${plan.isPopular ? 'text-blue-300' : 'text-blue-300'}`}>{plan.name}</p>

        <div className="flex items-end gap-1.5 mb-1">
          <span className={`text-5xl font-bold tabular-nums text-white`}>
            <NumberFlow
              value={isMonthly ? plan.price : plan.yearlyPrice}
              format={{ style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }}
              transformTiming={{ duration: 450, easing: 'ease-out' }}
              willChange
            />
          </span>
          <span className={`text-sm font-semibold mb-2 text-blue-300`}>/ {plan.period}</span>
        </div>
        <p className={`text-xs mb-5 text-blue-300/60`}>
          {isMonthly ? 'billed monthly' : 'billed annually'}
        </p>

        <ul className="space-y-2.5 flex-1">
          {plan.features.map(feat => (
            <li key={feat} className={`flex items-start gap-2 text-sm text-gray-300`}>
              <svg className={`w-4 h-4 shrink-0 mt-0.5 text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        <hr className={`my-5 border-white/10`} />

        {plan.href.startsWith('mailto') ? (
          <a
            href={plan.href}
            className={`block w-full text-center text-sm font-bold py-3 rounded-xl transition-all duration-200 border-2 ${
              plan.isPopular
                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'
                : 'border-white/20 text-gray-300 hover:border-blue-400 hover:text-blue-300'
            }`}
          >
            {plan.buttonText}
          </a>
        ) : plan.planKey === 'free' ? (
          <Link
            to={plan.href}
            className="block w-full text-center text-sm font-bold py-3 rounded-xl transition-all duration-200 border-2 border-white/20 text-gray-300 hover:border-blue-400 hover:text-blue-300"
          >
            {plan.buttonText}
          </Link>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`block w-full text-center text-sm font-bold py-3 rounded-xl transition-all duration-200 border-2 disabled:opacity-60 disabled:cursor-not-allowed ${
              plan.isPopular
                ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'
                : 'border-white/20 text-gray-300 hover:border-blue-400 hover:text-blue-300'
            }`}
          >
            {loading ? 'Redirecting…' : plan.buttonText}
          </button>
        )}

        <p className={`text-center text-xs mt-4 text-blue-300/50`}>{plan.description}</p>
      </div>
    </motion.div>
  )
}

const GOOGLE_CLIENT_ID = '967890373759-ipj8p88gon40euaqq15vsjqpf9rl058d.apps.googleusercontent.com'

export default function Landing() {
  const [isMonthly, setIsMonthly] = useState(true)
  const [supportOpen, setSupportOpen] = useState(false)
  const switchRef = useRef(null)
  const { setToken, setUser } = useAuthStore()
  const navigate = useNavigate()


  // Google One Tap
  useEffect(() => {
    // Decode JWT payload without a library
    const decodeJwt = (token) => {
      try {
        return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      } catch { return null }
    }

    const handleCredential = async ({ credential }) => {
      const payload = decodeJwt(credential)
      if (!payload) return
      try {
        const res = await fetch('http://localhost:8000/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential,
            email: payload.email,
            name: payload.name,
          }),
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        setToken(data.access_token)
        setUser(data.user)
        navigate('/dashboard')
      } catch {
        console.error('Google login failed')
      }
    }

    const init = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.prompt()
    }

    if (window.google?.accounts?.id) {
      init()
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = init
      document.head.appendChild(script)
      return () => document.head.removeChild(script)
    }
  }, [navigate, setToken, setUser])

  const handleBillingToggle = () => {
    const next = !isMonthly
    setIsMonthly(next)
    // Annual toggle fires confetti
    if (!next && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect()
      confetti({
        particleCount: 60,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#6366f1', '#a855f7', '#0ea5e9', '#f59e0b'],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ['circle'],
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#060d1f] flex flex-col font-sans">
      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
      <StarfieldBg />
      <SpaceEffects />
      {/* All content is relative so it scrolls over the fixed bg */}
      <div className="relative z-10 flex flex-col min-h-screen">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10 sticky top-0 bg-[#060d1f]/80 backdrop-blur z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/20">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-lg font-semibold tracking-wide text-white">
            ExamPrep
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="px-4 py-2 text-sm font-medium text-white/50 hover:text-blue-300 transition"
            onClick={e => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }}
          >
            Pricing
          </a>
          <button
            onClick={() => setSupportOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white/50 hover:text-blue-300 transition"
          >
            Support
          </button>
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/50 hover:text-blue-300 transition">
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-500/30"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative w-full overflow-hidden text-white px-8 pt-20 pb-24">
        {/* Extra nebula glow centred on hero */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[400px] bg-blue-700/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT — text + CTAs */}
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              AI-Powered Exam Prep for K-12
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white">
              Turn Your Notes Into<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Exam Success</span>
            </h1>
            <p className="mt-5 text-lg text-blue-100 leading-relaxed max-w-md">
              Upload your study notes and let AI generate practice questions tailored just for you.
              Quiz yourself, take mock exams, and track what you need to improve.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="group px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-400/40 transition-all duration-200 hover:-translate-y-0.5 text-base"
              >
                Start Free — 7 Days on Us
                <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 border-2 border-white/50 text-white hover:bg-white/10 font-semibold rounded-2xl transition text-base"
              >
                I have an account
              </Link>
            </div>
            <p className="mt-4 text-xs text-blue-300/70">No credit card needed · Cancel anytime</p>

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { end: 5000, suffix: '+', label: 'Students' },
                { end: 120000, suffix: '+', label: 'Questions Generated' },
                { end: 98, suffix: '%', label: 'Satisfaction' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-white">
                    <CountUp end={s.end} suffix={s.suffix} />
                  </p>
                  <p className="text-blue-300 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — mock quiz card */}
          <div className="relative flex justify-center items-center">
            {/* Floating badge — top left */}
            <div className="absolute -top-4 -left-4 z-20 bg-white shadow-xl rounded-2xl px-4 py-2.5 text-sm font-semibold text-gray-700 flex items-center gap-2 animate-[float1_3s_ease-in-out_infinite]">
              🧠 Smart Analysis
            </div>

            {/* Main card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Card header */}
              <div className="bg-indigo-50 px-5 py-4 flex items-center justify-between border-b border-indigo-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-indigo-700">AI Generated Quiz</span>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">Score: 78%</span>
              </div>

              {/* Question */}
              <div className="px-5 py-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Question 3 of 10</p>
                <p className="text-sm font-semibold text-gray-800 mb-3">What is Newton's Second Law of Motion?</p>

                <div className="space-y-2">
                  {[
                    { label: 'A', text: 'F = ma', correct: true },
                    { label: 'B', text: 'E = mc²', correct: false },
                    { label: 'C', text: 'V = IR', correct: false },
                    { label: 'D', text: 'P = mv', correct: false },
                  ].map(opt => (
                    <div
                      key={opt.label}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium border ${
                        opt.correct
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-gray-50 border-gray-100 text-gray-600'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${opt.correct ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {opt.label}
                      </span>
                      {opt.text}
                      {opt.correct && (
                        <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI insight */}
                <div className="mt-3 bg-indigo-50 rounded-xl px-3 py-2.5 flex items-start gap-2">
                  <span className="text-base">⚡</span>
                  <p className="text-xs text-indigo-700 font-medium">AI Insight: Focus more on Physics — you got 3 wrong here.</p>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span><span>3 / 10</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[30%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge — bottom right */}
            <div className="absolute -bottom-4 -right-4 z-20 bg-white shadow-xl rounded-2xl px-4 py-2.5 text-sm font-semibold text-gray-700 flex items-center gap-2 animate-[float2_3s_ease-in-out_infinite]">
              📊 Progress Tracking
            </div>
          </div>

        </div>
      </div>

      {/* How it works */}
      <section className="relative px-8 py-24">
        {/* Section glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-700/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              ⚙️ How it works
            </span>
            <h2 className="text-4xl font-extrabold text-white mb-3">Three steps to exam-ready</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">From raw notes to confident exam performance in under a minute.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Upload your notes', desc: 'Drop in any PDF, Word doc, or plain text file.', icon: (
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              )},
              { num: '02', title: 'AI builds your quiz', desc: 'Questions are generated in under 30 seconds.', icon: (
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              )},
              { num: '03', title: 'Practice & improve', desc: 'Track scores, spot weak areas, repeat until ready.', icon: (
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              )},
            ].map((s, i) => (
              <div key={s.num} className="relative group">
                {/* Connector arrow */}
                {i < 2 && (
                  <div className="hidden sm:flex absolute top-10 -right-3 z-10 items-center justify-center w-6 h-6 text-blue-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                )}
                <div className="h-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/30 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {s.icon}
                    </div>
                    <span className="text-xs font-bold text-gray-600 tracking-widest">{s.num}</span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — scroll-jacked 3D carousel */}
      <FeatureCarousel />

      {/* 7-Day Trial CTA Banner */}
      <section className="relative px-8 py-20 flex justify-center">
        <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl">
          {/* Gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 px-10 py-12">
            {/* Left text */}
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Limited Time Offer
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
                Try ExamPrep<br />
                <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">Free for 7 Days</span>
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
                Get full access to every feature — no strings attached. See the difference AI-powered practice makes before you commit.
              </p>
            </div>

            {/* Right card */}
            <div className="w-full lg:w-80 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-xl">
              <p className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-3">What's included</p>
              <ul className="space-y-2.5 mb-6">
                {trialPerks.map(perk => (
                  <li key={perk} className="flex items-center gap-2.5 text-sm text-blue-50">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-400/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition shadow-md text-sm"
              >
                Claim Your Free 7 Days →
              </Link>
              <p className="text-center text-xs text-blue-200/60 mt-3">No card required · Instant access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials marquee */}
      <TestimonialsSection
        title="Thousands of students already acing their exams"
        description="See what real students say after using ExamPrep to prepare."
        testimonials={[
          {
            text: "I went from failing practice tests to acing my finals. ExamPrep is a game changer.",
            author: { name: "Aisha K.", handle: "Grade 11", rating: 5, avatarColor: "#6366f1", avatarColor2: "#9333ea" },
          },
          {
            text: "The AI quiz questions were spot-on with what actually came in the exam. Genuinely impressed.",
            author: { name: "Marcus T.", handle: "Grade 10", rating: 5, avatarColor: "#9333ea", avatarColor2: "#0ea5e9" },
          },
          {
            text: "Took 5 mock exams in one weekend. My confidence shot through the roof before the real thing.",
            author: { name: "Priya N.", handle: "Grade 12", rating: 5, avatarColor: "#7c3aed", avatarColor2: "#6366f1" },
          },
          {
            text: "I uploaded my biology notes and had 40 practice questions in under a minute. Wild.",
            author: { name: "Jordan M.", handle: "Grade 9", rating: 5, avatarColor: "#0ea5e9", avatarColor2: "#f59e0b" },
          },
          {
            text: "The mock exam timer made the real test feel easy. I knew exactly how to pace myself.",
            author: { name: "Sofia R.", handle: "Grade 11", rating: 5, avatarColor: "#0ea5e9", avatarColor2: "#6366f1" },
          },
          {
            text: "Used ExamPrep for three subjects. My average went from a C to an A- in one term.",
            author: { name: "Ethan L.", handle: "Grade 10", rating: 5, avatarColor: "#10b981", avatarColor2: "#6366f1" },
          },
        ]}
      />

      {/* Pricing */}
      <section id="pricing" className="relative px-8 py-20">
        <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Pricing</p>
        <h2 className="text-4xl font-extrabold text-center text-white mb-3">Simple, transparent pricing</h2>
        <p className="text-center text-gray-400 text-sm mb-10">Start free. Upgrade when you're ready.</p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-14">
          <span className={`text-sm font-semibold ${isMonthly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <button
            ref={switchRef}
            onClick={handleBillingToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${!isMonthly ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${!isMonthly ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-semibold ${!isMonthly ? 'text-white' : 'text-gray-500'}`}>
            Annual <span className="text-blue-400 font-bold">(Save 20%)</span>
          </span>
        </div>

        {/* Plan cards */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-4xl mx-auto items-center"
          style={{ perspective: '1200px' }}
        >
          {pricingPlans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} isMonthly={isMonthly} />
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="max-w-4xl mx-auto mt-20">
          <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Compare Plans</p>
          <h3 className="text-2xl font-extrabold text-center text-white mb-8">See exactly what you get</h3>
        </div>
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-blue-900/20">
          {/* Table header */}
          <div className="grid grid-cols-4 bg-[#0a1628] border-b border-white/10">
            <div className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Feature</div>
            {[
              { label: 'Free', sub: '$0 / 7 days' },
              { label: 'Pro', sub: `$${isMonthly ? '5' : '4'} / mo`, highlight: true },
              { label: 'School', sub: `$${isMonthly ? '49' : '39'} / mo` },
            ].map(col => (
              <div key={col.label} className={`px-6 py-4 text-center ${col.highlight ? 'bg-blue-600' : ''}`}>
                <p className={`text-sm font-bold ${col.highlight ? 'text-white' : 'text-gray-300'}`}>{col.label}</p>
                <p className={`text-xs mt-0.5 ${col.highlight ? 'text-blue-200' : 'text-gray-500'}`}>{col.sub}</p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {[
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
          ].map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-4 border-b border-white/5 ${i % 2 === 0 ? 'bg-[#060d1f]' : 'bg-[#0a1628]/60'}`}>
              <div className="px-6 py-3.5 text-sm text-gray-400 font-medium flex items-center">{row.feature}</div>
              {[row.free, row.pro, row.school].map((val, ci) => (
                <div key={ci} className={`px-6 py-3.5 flex items-center justify-center ${ci === 1 ? 'bg-blue-600/10' : ''}`}>
                  {val === true ? (
                    <span className="w-6 h-6 rounded-full bg-blue-900/60 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : val === false ? (
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  ) : (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${ci === 1 ? 'bg-blue-900/50 text-blue-300' : 'bg-white/5 text-gray-400'}`}>
                      {val}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          All plans include a 7-day free trial · Prices in USD · Cancel anytime
        </p>
      </section>

      {/* Final CTA */}
      <section className="relative px-8 py-20">
        <div className="max-w-3xl mx-auto relative">
          {/* Glow behind card */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-cyan-600/30 rounded-3xl blur-2xl scale-105 pointer-events-none" />
          <div className="relative bg-white/[0.04] border border-white/10 rounded-3xl px-10 py-14 text-center text-white overflow-hidden">
            {/* Inner decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-1 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent rounded-full" />
            <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
              🚀 Start today — it's free
            </span>
            <h2 className="text-4xl font-extrabold mb-3 leading-tight text-white">
              Ready to ace your<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">next exam?</span>
            </h2>
            <p className="text-gray-400 mb-8 text-sm max-w-sm mx-auto">Join thousands of students already using ExamPrep to study smarter and score higher.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 text-base"
              >
                Get Started — It's Free →
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 border border-white/20 text-gray-300 hover:bg-white/5 font-semibold rounded-2xl transition text-base"
              >
                I have an account
              </Link>
            </div>
            <p className="text-xs text-gray-600 mt-5">No credit card · Cancel anytime · Instant access</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600/20 p-1.5 rounded-lg border border-blue-500/20">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">ExamPrep</span>
            <span className="text-gray-600 text-xs ml-2">© 2026 · Built for K-12 students</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#pricing" className="text-xs text-gray-500 hover:text-blue-400 transition" onClick={e => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }}>Pricing</a>
            <Link to="/login" className="text-xs text-gray-500 hover:text-blue-400 transition">Login</Link>
            <Link to="/signup" className="text-xs text-gray-500 hover:text-blue-400 transition">Sign Up</Link>
            <button onClick={() => setSupportOpen(true)} className="text-xs text-gray-500 hover:text-blue-400 transition">Support</button>
          </div>
        </div>
      </footer>
      </div>{/* end scrollable content */}
    </div>
  )
}
