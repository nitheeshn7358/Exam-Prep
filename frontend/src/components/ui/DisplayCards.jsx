/**
 * DisplayCards — stacked skew cards with hover reveal + scale-up to show full content
 */
import { motion } from 'framer-motion'

function DisplayCard({
  className = '',
  icon,
  title = 'Feature',
  description = '',
  tag = '',
  iconBg = 'bg-indigo-700',
  titleClassName = 'text-indigo-400',
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.45,
        zIndex: 100,
        transition: { duration: 0.22, ease: 'easeOut' },
      }}
      style={{ transformOrigin: 'left center' }}
      className={[
        // Core shape
        'relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between',
        'rounded-xl border-2 border-gray-200 bg-gray-100/70 backdrop-blur-sm',
        'px-4 py-3 cursor-default',
        // Right-side fade gradient
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem]",
        "after:bg-gradient-to-l after:from-gray-50 after:to-transparent after:content-['']",
        // Remove the fade on hover so content isn't obscured when enlarged
        'hover:after:opacity-0 after:transition-opacity after:duration-300',
        'hover:border-indigo-200/60 hover:bg-white hover:shadow-xl',
        '[&>*]:flex [&>*]:items-center [&>*]:gap-2',
        className,
      ].join(' ')}
    >
      {/* Row 1 — icon + title */}
      <div>
        <span className={`relative inline-block rounded-full ${iconBg} p-1.5`}>
          <span className="text-sm leading-none">{icon}</span>
        </span>
        <p className={`text-base font-semibold ${titleClassName}`}>{title}</p>
      </div>

      {/* Row 2 — description (nowrap so full text shows when card is scaled) */}
      <p className="whitespace-nowrap text-sm text-gray-700">{description}</p>

      {/* Row 3 — tag */}
      <p className="text-xs text-gray-400">{tag}</p>
    </motion.div>
  )
}

export default function DisplayCards({ cards }) {
  const defaultCards = [
    {
      // Back card
      icon: '📤',
      title: 'Upload Notes',
      description: 'PDF, DOCX, or plain text — processed in seconds',
      tag: 'Free plan',
      iconBg: 'bg-indigo-700',
      titleClassName: 'text-indigo-500',
      className: [
        '[grid-area:stack]',
        "before:absolute before:left-0 before:top-0 before:h-full before:w-full before:rounded-xl before:content-['']",
        'before:bg-gray-50/50 before:bg-blend-overlay',
        'before:transition-opacity before:duration-500',
        'grayscale hover:grayscale-0 hover:before:opacity-0',
        'transition-[filter] duration-300',
      ].join(' '),
    },
    {
      // Middle-back card
      icon: '📝',
      title: 'Practice MCQs',
      description: 'AI questions built from your own notes',
      tag: 'AI powered',
      iconBg: 'bg-purple-700',
      titleClassName: 'text-purple-500',
      className: [
        '[grid-area:stack] translate-x-12 translate-y-8',
        "before:absolute before:left-0 before:top-0 before:h-full before:w-full before:rounded-xl before:content-['']",
        'before:bg-gray-50/50 before:bg-blend-overlay',
        'before:transition-opacity before:duration-500',
        'grayscale hover:grayscale-0 hover:before:opacity-0',
        'transition-[filter] duration-300',
      ].join(' '),
    },
    {
      // Middle-front card
      icon: '⏱️',
      title: 'Mock Exams',
      description: 'Timed exam mode with violation detection',
      tag: 'Pro feature',
      iconBg: 'bg-violet-700',
      titleClassName: 'text-violet-500',
      className: [
        '[grid-area:stack] translate-x-24 translate-y-16',
        "before:absolute before:left-0 before:top-0 before:h-full before:w-full before:rounded-xl before:content-['']",
        'before:bg-gray-50/50 before:bg-blend-overlay',
        'before:transition-opacity before:duration-500',
        'grayscale hover:grayscale-0 hover:before:opacity-0',
        'transition-[filter] duration-300',
      ].join(' '),
    },
    {
      // Front card — fully visible by default
      icon: '📊',
      title: 'Track Progress',
      description: 'Weak topics, scores & history at a glance',
      tag: 'Always on',
      iconBg: 'bg-pink-700',
      titleClassName: 'text-pink-500',
      className: '[grid-area:stack] translate-x-36 translate-y-24',
    },
  ]

  const displayCards = cards || defaultCards

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  )
}
