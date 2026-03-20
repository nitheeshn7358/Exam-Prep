import { useEffect, useRef, useState } from 'react'

/**
 * Detects tab switches / window blur during exams.
 * violations: 0 = clean, 1 = first warning shown, 2 = final warning shown, 3 = auto-submit triggered
 */
export default function useTabGuard({ onAutoSubmit, enabled = true }) {
  const [violations, setViolations] = useState(0)
  const [warningVisible, setWarningVisible] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const violationsRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        violationsRef.current += 1
        const count = violationsRef.current

        if (count === 1) {
          setWarningMessage('⚠️ You switched tabs! This is your only warning. Do it again and your session will be auto-submitted immediately.')
          setWarningVisible(true)
          setViolations(1)
        } else if (count >= 2) {
          setViolations(2)
          setWarningVisible(false)
          onAutoSubmit(count)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, onAutoSubmit])

  const dismissWarning = () => setWarningVisible(false)

  return { violations, warningVisible, warningMessage, dismissWarning }
}
