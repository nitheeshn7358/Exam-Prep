import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppLayout from '../../components/layout/AppLayout'
import api from '../../api/api'

const FAQS = [
  {
    q: 'How do I upload my notes?',
    a: 'Go to the Upload page from the sidebar or click "New Upload". You can upload PDF, Word (.docx), or plain text files. AI will process them and generate practice questions within 30 seconds.',
    icon: '📤',
  },
  {
    q: 'What file formats are supported?',
    a: 'We support PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files. Make sure your file is under 20 MB for best results.',
    icon: '📁',
  },
  {
    q: 'How many questions does AI generate?',
    a: 'By default, AI generates up to 20 multiple-choice questions per note. The number may vary depending on the length and content of your document.',
    icon: '🤖',
  },
  {
    q: 'What is the difference between Quiz and Mock Exam?',
    a: 'In Quiz mode, you get instant feedback after each question with an explanation. In Mock Exam mode, all questions are shown at once with a 30-minute countdown timer — simulating real exam conditions.',
    icon: '📝',
  },
  {
    q: 'What are Subjects?',
    a: 'Subjects let you group multiple notes (chapters) together and practice them as one combined quiz or exam. This is ideal for end-of-term revision across multiple topics.',
    icon: '📚',
  },
  {
    q: 'What is tab-switch detection?',
    a: 'During a Mock Exam, the app detects if you switch to another tab or window. After 2 violations, the exam is automatically submitted. This helps you practise under honest, focused conditions.',
    icon: '🔍',
  },
  {
    q: 'How do I upgrade to Pro?',
    a: 'Click "Pricing" in the top bar or go to the Plans page. Click "Get Pro", complete the Stripe checkout with your card, and your plan upgrades instantly.',
    icon: '⚡',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes — you can cancel anytime. Your Pro features remain active until the end of the billing period, after which your account returns to the Free plan.',
    icon: '🔄',
  },
  {
    q: 'My questions look wrong or irrelevant. What should I do?',
    a: 'This can happen if the uploaded file has scanned images or poor formatting. Try uploading a text-selectable PDF or a Word document with clear headings. You can also delete the note and re-upload.',
    icon: '⚠️',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Your notes and data are stored securely in an encrypted database. We never share your content with third parties.',
    icon: '🔒',
  },
]

const QUICK_LINKS = [
  { icon: '📤', label: 'Upload Notes', desc: 'Add your study material', href: '/upload' },
  { icon: '📊', label: 'View Analytics', desc: 'Track your progress', href: '/analytics' },
  { icon: '💎', label: 'Upgrade Plan', desc: 'Unlock all features', href: '/plans' },
]

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
        open
          ? 'border-blue-400 dark:border-blue-700 shadow-lg shadow-blue-200/60 dark:shadow-blue-900/20 scale-[1.01]'
          : 'border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-white hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-white/5 hover:scale-[1.005]'
      }`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
          open
            ? 'bg-blue-50/80 dark:bg-gray-800'
            : 'bg-white/80 dark:bg-gray-900 hover:bg-blue-50/50 dark:hover:bg-gray-800/60'
        }`}
      >
        <span className={`text-xl shrink-0 transition-transform duration-200 ${open ? 'scale-110' : ''}`}>{faq.icon}</span>
        <span className={`flex-1 text-sm font-semibold transition-colors duration-200 ${
          open ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-100'
        }`}>{faq.q}</span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
          open ? 'bg-blue-500 dark:bg-blue-500 shadow-md shadow-blue-300/40' : 'bg-blue-100/80 dark:bg-gray-700'
        }`}>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180 text-white' : 'text-blue-400 dark:text-gray-300'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 pt-2 bg-blue-50/40 dark:bg-gray-900 border-t-2 border-blue-100 dark:border-gray-700">
              <div className="pl-10 flex gap-2">
                <div className="w-0.5 rounded-full bg-blue-300 dark:bg-blue-700 self-stretch shrink-0" />
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pl-2">{faq.a}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Support() {
  const [form, setForm] = useState({ subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formHovered, setFormHovered] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/support', form)
      setSuccess(true)
      setForm({ subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      {/* Page-level blue gradient background */}
      <div className="min-h-full -m-6 px-8 py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 dark:from-gray-950 dark:via-indigo-950/40 dark:to-gray-950">
      <div className="max-w-5xl space-y-10">

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 p-8 text-white shadow-xl shadow-blue-200/50 dark:shadow-blue-900/30"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👋</span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Help Centre</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight mb-2">How can we help you?</h1>
              <p className="text-blue-100 text-sm max-w-md">Browse the FAQ below or send us a message — we typically respond within 24 hours.</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {QUICK_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 bg-white/15 hover:bg-white/25 transition-colors rounded-xl px-4 py-2.5 text-sm font-medium"
                >
                  <span>{link.icon}</span>
                  <div>
                    <p className="font-semibold leading-tight">{link.label}</p>
                    <p className="text-blue-100 text-xs leading-tight">{link.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* FAQ — wider column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-50">Frequently Asked Questions</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">{FAQS.length} questions answered</p>
              </div>
            </div>

            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} />
              ))}
            </div>
          </div>

          {/* Contact form — narrower column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2 lg:sticky lg:top-6"
          >
            <div
              className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden cursor-pointer"
              onMouseEnter={() => setFormHovered(true)}
              onMouseLeave={() => setFormHovered(false)}
            >
              {/* Card header — always visible */}
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-50">Still need help?</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">We reply within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Dropdown form — slides in on hover */}
              <AnimatePresence initial={false}>
                {formHovered && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                  >
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3 py-8 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-800 dark:text-gray-100">Message sent!</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">We'll reply to your email within 24 hours.</p>
                      </div>
                      <button
                        onClick={() => setSuccess(false)}
                        className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Send another →
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl px-4 py-3">
                          {error}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Query</label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                          placeholder="e.g. Question about uploads"
                          required
                          className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">Message</label>
                        <textarea
                          value={form.message}
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          placeholder="Describe your issue in detail..."
                          required
                          rows={5}
                          className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-gray-400 dark:text-gray-600">
                        We'll reply directly to your registered email
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Response time badge */}
            <div className="mt-4 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 rounded-2xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">Average response time: under 24 hours</p>
            </div>
          </motion.div>

        </div>
      </div>
      </div>
    </AppLayout>
  )
}
