export default function TabWarningModal({ visible, message, violations, onDismiss }) {
  if (!visible) return null

  const isFinal = violations >= 2

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 border-2 ${isFinal ? 'border-red-400' : 'border-yellow-400'}`}>

        {/* Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isFinal ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
          {isFinal ? (
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 className={`text-lg font-bold text-center mb-2 ${isFinal ? 'text-red-600' : 'text-yellow-700'}`}>
          {isFinal ? 'Final Warning!' : 'Tab Switch Detected!'}
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-1">{message}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-5">
          Violation {violations} of 2
        </p>

        {/* Button */}
        <button
          onClick={onDismiss}
          className={`w-full font-semibold py-2.5 rounded-xl transition text-white ${isFinal ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
        >
          I Understand — Back to {violations >= 2 ? 'Exam' : 'Quiz'}
        </button>
      </div>
    </div>
  )
}
