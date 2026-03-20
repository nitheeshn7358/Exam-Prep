/**
 * FeatureCarousel
 * ─────────────────────────────────────────────────────────────────────────────
 * Scroll-jacked 3D card carousel for the landing page features section.
 *
 * How it works:
 *  - The outer container is 300 vh tall (3 transitions for 4 cards).
 *  - The inner container is `position: sticky` so it stays in the viewport while
 *    the user scrolls through those 300 vh.
 *  - `useScroll` maps scrollYProgress (0 → 1) to a rotation index `r` (0 → 3).
 *  - Each card has pre-computed `useTransform` motion values for x, y, rotateY,
 *    scale, opacity, and zIndex.  The transforms interpolate between the four
 *    slot positions (front / right / back / left) as `r` increases.
 *  - After `r` reaches 3 (last card at front) the outer container ends, so the
 *    page naturally scrolls on to the next section.
 */
import { useRef, useState, useEffect } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion'

// ─── feature data ────────────────────────────────────────────────────────────

const CARDS = [
  {
    icon: '📤',
    title: 'Upload Notes',
    description:
      'Drop in any PDF, DOCX, or plain text file — AI processes and builds your question bank in under 30 seconds.',
    tag: 'Free plan',
    accent: '#6366f1',
    bg: 'bg-indigo-600',
    light: 'bg-indigo-50',
    text: 'text-indigo-600',
    ring: 'ring-indigo-200',
  },
  {
    icon: '📝',
    title: 'Practice MCQs',
    description:
      'AI generates targeted multiple-choice questions built directly from your uploaded content — not generic questions.',
    tag: 'AI powered',
    accent: '#9333ea',
    bg: 'bg-purple-600',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-200',
  },
  {
    icon: '⏱️',
    title: 'Mock Exams',
    description:
      'Simulate real exam pressure: countdown timer, tab-switch detection, and a violation report at the end.',
    tag: 'Pro feature',
    accent: '#7c3aed',
    bg: 'bg-violet-600',
    light: 'bg-violet-50',
    text: 'text-violet-600',
    ring: 'ring-violet-200',
  },
  {
    icon: '📊',
    title: 'Track Progress',
    description:
      'See your score history, weak topics, and improvement trend across every practice session and mock exam.',
    tag: 'Always on',
    accent: '#ec4899',
    bg: 'bg-pink-600',
    light: 'bg-pink-50',
    text: 'text-pink-600',
    ring: 'ring-pink-200',
  },
]

const N = CARDS.length
const STEPS = [0, 1, 2, 3] // rotation index keyframes

// ─── slot positions ───────────────────────────────────────────────────────────
// Slot 0 = front, 1 = right, 2 = back, 3 = left

const SLOTS = [
  { x: 0,    y: -15, rotateY: 0,   scale: 1,    opacity: 1,    zIndex: 10 },
  { x: 310,  y: 28,  rotateY: -44, scale: 0.78, opacity: 0.72, zIndex: 6  },
  { x: 46,   y: 62,  rotateY: -6,  scale: 0.55, opacity: 0.25, zIndex: 2  },
  { x: -310, y: 28,  rotateY: 44,  scale: 0.78, opacity: 0.72, zIndex: 6  },
]

// Build per-card keyframe arrays for each property
// At rotation step `s`, card `i` occupies slot `(i - s + N) % N`
function getCardKeyframes(cardIndex) {
  const kf = { x: [], y: [], rotateY: [], scale: [], opacity: [], zIndex: [] }
  for (let step = 0; step < N; step++) {
    const slot = SLOTS[(cardIndex - step + N) % N]
    kf.x.push(slot.x)
    kf.y.push(slot.y)
    kf.rotateY.push(slot.rotateY)
    kf.scale.push(slot.scale)
    kf.opacity.push(slot.opacity)
    kf.zIndex.push(slot.zIndex)
  }
  return kf
}

// ─── individual card ──────────────────────────────────────────────────────────

function FeatureCard({ card, cardIndex, r }) {
  const kf = getCardKeyframes(cardIndex)

  const x       = useTransform(r, STEPS, kf.x)
  const y       = useTransform(r, STEPS, kf.y)
  const rotateY = useTransform(r, STEPS, kf.rotateY)
  const scale   = useTransform(r, STEPS, kf.scale)
  const opacity = useTransform(r, STEPS, kf.opacity)
  const zIndex  = useTransform(r, STEPS, kf.zIndex)

  return (
    <motion.div
      style={{
        position: 'absolute',
        // Offset by half card size so cards are centered on the anchor
        width: '30rem',
        height: 'auto',
        minHeight: '13rem',
        marginLeft: '-15rem',
        marginTop: '-6.5rem',
        x,
        y,
        rotateY,
        scale,
        opacity,
        zIndex,
        transformStyle: 'preserve-3d',
      }}
      className="bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/10 p-7 flex flex-col gap-4 select-none"
    >
      {/* Icon + title + tag */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-xl ${card.bg} flex items-center justify-center text-2xl shadow-sm shrink-0`}>
          {card.icon}
        </div>
        <div>
          <p className="font-bold text-white text-lg leading-tight">{card.title}</p>
          <span className={`mt-1 inline-block text-sm font-semibold ${card.text}`}>{card.tag}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-base text-gray-400 leading-relaxed">{card.description}</p>

      {/* Coloured bottom accent */}
      <div
        className="h-1 w-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${card.accent}, ${card.accent}44)` }}
      />
    </motion.div>
  )
}

// ─── main carousel ────────────────────────────────────────────────────────────

export default function FeatureCarousel() {
  const containerRef = useRef(null)

  // Track scroll through the full 300 vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // r goes 0 → N-1 (0 → 3) as we scroll 0% → 100%
  const r = useTransform(scrollYProgress, [0, 1], [0, N - 1])

  // Active index for progress dots
  const [activeIndex, setActiveIndex] = useState(0)
  useMotionValueEvent(r, 'change', (latest) => setActiveIndex(Math.round(latest)))

  // Idle hint — shown 5 s after scrolling stops while on the last card
  const [showHint, setShowHint] = useState(false)
  const hintTimerRef = useRef(null)

  useEffect(() => {
    const startTimer = () => {
      clearTimeout(hintTimerRef.current)
      hintTimerRef.current = setTimeout(() => setShowHint(true), 5000)
    }

    const onScroll = () => {
      setShowHint(false)
      startTimer()
    }

    startTimer()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(hintTimerRef.current)
    }
  }, [])

  return (
    // ── outer: tall so scroll has room to travel ──────────────────────────────
    <div ref={containerRef} style={{ height: `${(N - 1) * 100}vh` }}>

      {/* ── inner: stays pinned to viewport while we scroll ─────────────────── */}
      <div
        className="sticky flex flex-col"
        style={{ top: '57px', height: 'calc(100vh - 57px)' }}
      >
        {/* Section header */}
        <div className="pt-12 pb-4 text-center shrink-0">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Features</p>
          <h2 className="text-3xl font-extrabold text-white">Everything you need to prepare</h2>
          <p className="text-sm text-gray-400 mt-1.5">Scroll to rotate through each feature</p>
        </div>

        {/* 3D scene */}
        <div
          className="flex-1 relative"
          style={{ perspective: '900px', perspectiveOrigin: '50% 42%' }}
        >
          {/*
            Zero-size anchor exactly in the centre of the scene.
            Cards are absolutely positioned relative to this point,
            so their x / y motion values move them around the centre.
          */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
            {CARDS.map((card, i) => (
              <FeatureCard key={i} card={card} cardIndex={i} r={r} />
            ))}
          </div>
        </div>

        {/* Idle hint only — no dots */}
        <div className="pb-6 flex justify-center shrink-0">
          <motion.p
            className="text-xs text-blue-400/60 font-medium"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: showHint ? 1 : 0, y: showHint ? 0 : 4 }}
            transition={{ duration: 0.5 }}
          >
            ↓ Keep scrolling to continue
          </motion.p>
        </div>
      </div>
    </div>
  )
}
