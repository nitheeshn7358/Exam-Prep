import { useEffect, useRef } from 'react'

/**
 * AuroraBackground
 * - Renders a full-bleed aurora layer using the project's indigo/purple palette
 * - The wave position shifts with scroll (vertical parallax)
 * - className / style props are forwarded to the outer wrapper so callers can
 *   control height, padding, text colour, etc.
 */
export function AuroraBackground({
  children,
  className = '',
  showRadialGradient = true,
  style = {},
}) {
  const auroraRef = useRef(null)

  useEffect(() => {
    const el = auroraRef.current
    if (!el) return

    const onScroll = () => {
      // Map scroll 0→2000px to backgroundPosition 50%→150% so the aurora
      // drifts upward as the user scrolls down — feels naturally linked.
      const offset = 50 + (window.scrollY / 2000) * 100
      el.style.backgroundPositionY = `${offset}%`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`relative flex flex-col items-center justify-center transition-bg ${className}`}
      style={style}
    >
      {/* Aurora layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={auroraRef}
          className={[
            // Base repeating gradient (light — inverted for dark bg via invert-0)
            '[--white-gradient:repeating-linear-gradient(100deg,var(--color-white)_0%,var(--color-white)_7%,transparent_10%,transparent_12%,var(--color-white)_16%)]',
            // Aurora colours — indigo / purple palette
            '[--aurora:repeating-linear-gradient(100deg,#6366f1_10%,#a5b4fc_15%,#c4b5fd_20%,#e9d5ff_25%,#818cf8_30%)]',
            '[background-image:var(--white-gradient),var(--aurora)]',
            '[background-size:300%,_200%]',
            '[background-position:50%_50%,50%_50%]',
            // invert-0 keeps aurora colours on dark backgrounds; remove if light bg
            'invert-0',
            'filter blur-[10px]',
            // Pseudo-element second pass for depth
            'after:content-[""] after:absolute after:inset-0',
            'after:[background-image:var(--white-gradient),var(--aurora)]',
            'after:[background-size:200%,_100%]',
            'after:animate-aurora',
            'after:[background-attachment:fixed]',
            'after:mix-blend-difference',
            'animate-aurora',
            'absolute -inset-[10px] opacity-50 will-change-transform',
            showRadialGradient
              ? '[mask-image:radial-gradient(ellipse_at_80%_0%,black_10%,transparent_70%)]'
              : '',
          ].join(' ')}
        />
      </div>

      {children}
    </div>
  )
}
