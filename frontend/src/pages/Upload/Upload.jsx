import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api/api'
import useAuthStore from '../../store/authStore'
import AppLayout from '../../components/layout/AppLayout'
import UpgradeModal from '../../components/common/UpgradeModal'
import usePlan from '../../hooks/usePlan'

export default function Upload() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const subjectId = searchParams.get('subject') ? Number(searchParams.get('subject')) : null
  const { logout } = useAuthStore()
  const { can, plan } = usePlan()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [numQuestions, setNumQuestions] = useState(10)
  const [subjectName, setSubjectName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState('idle') // idle | uploading | generating | done | error
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [noteCount, setNoteCount] = useState(null)

  useEffect(() => {
    if (plan === 'free') {
      api.get('/notes/count').then(res => setNoteCount(res.data.count)).catch(() => {})
    }
  }, [plan])

  useEffect(() => {
    if (subjectId) {
      api.get(`/subjects/${subjectId}`)
        .then(res => setSubjectName(res.data.name))
        .catch(() => {})
    }
  }, [subjectId])

  const atFreeLimit = plan === 'free' && noteCount !== null && noteCount >= 3

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowed.includes(f.type)) {
      setError('Only PDF, DOCX, and TXT files are supported.')
      return
    }
    if (f.size > 25 * 1024 * 1024) {
      setError('File exceeds the 25 MB limit. Please use a smaller file.')
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    if (atFreeLimit) {
      setShowUpgradeModal(true)
      return
    }

    setError('')
    setStatus('uploading')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('num_questions', numQuestions)
    if (subjectId) formData.append('subject_id', subjectId)

    try {
      setStatus('generating')
      await api.post('/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStatus('done')
      setTimeout(() => navigate(subjectId ? `/subjects/${subjectId}` : '/dashboard'), 1200)
    } catch (err) {
      if (err.response?.status === 403) {
        setStatus('idle')
        setShowUpgradeModal(true)
      } else {
        setStatus('error')
        setError(err.response?.data?.detail || 'Upload failed. Please try again.')
      }
    }
  }

  const fileIcon = (type) => {
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('word')) return '📝'
    return '📃'
  }

  return (
    <AppLayout
      title="Upload Study Notes"
      subtitle={subjectId && subjectName ? `Adding to subject: ${subjectName}` : 'AI will generate practice questions from your notes'}
    >
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Unlimited uploads"
        requiredPlan="pro"
      />
      <div className="max-w-2xl">

        {/* Free limit banner */}
        {plan === 'free' && noteCount !== null && (
          <div className={`mb-5 flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border text-sm ${atFreeLimit ? 'bg-red-50 border-red-200 text-red-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {atFreeLimit
                ? 'You\'ve reached the 3-upload limit on the Free plan.'
                : `Free plan: ${noteCount} / 3 uploads used.`}
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition flex-shrink-0 ${atFreeLimit ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              Upgrade →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all px-8 py-14 flex flex-col items-center justify-center text-center
              ${dragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            />

            {file ? (
              <>
                <div className="text-4xl mb-3">{fileIcon(file.type)}</div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{file.name}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB &middot; Click to change</p>
              </>
            ) : (
              <>
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-4 rounded-2xl mb-4">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Drop your file here or click to browse</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">PDF, DOCX, or TXT &middot; Max 25 MB</p>
              </>
            )}
          </div>

          {/* Question count */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Questions</label>
              <span className="text-indigo-600 font-bold text-lg">{numQuestions}</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>5</span>
              <span>50</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Status messages */}
          {status === 'generating' && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              AI is generating your {numQuestions} questions... this may take 15–30 seconds.
            </div>
          )}

          {status === 'done' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-xl px-4 py-3">
              Questions generated! Redirecting to dashboard...
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!file || status === 'uploading' || status === 'generating' || status === 'done'}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {status === 'generating' ? 'Generating Questions...' :
             status === 'done' ? 'Done!' :
             'Generate Questions'}
          </button>

        </form>
      </div>
    </AppLayout>
  )
}
