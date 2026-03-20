import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import FadeIn from '../../components/common/FadeIn'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notes')
      .then(res => setNotes(res.data))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note and all its questions?')) return
    try {
      await api.delete(`/notes/${noteId}`)
      setNotes(notes.filter(n => n.id !== noteId))
    } catch {
      alert('Failed to delete note.')
    }
  }

  const fileIcon = (title) => {
    if (title?.toLowerCase().endsWith('.pdf')) return (
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
    if (title?.toLowerCase().endsWith('.docx')) return (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
    return (
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }

  return (
    <AppLayout title="My Notes" subtitle="All your uploaded study documents">
      <div className="max-w-3xl space-y-4">

        {/* Upload button */}
        <FadeIn>
        <div className="flex justify-end">
          <Link
            to="/upload"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Upload New
          </Link>
        </div>
        </FadeIn>

        <FadeIn delay={100}>
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : notes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl mb-4">
              <svg className="w-10 h-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No notes yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-5">Upload your study notes to get started</p>
            <Link
              to="/upload"
              className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Upload your first note
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-4 flex items-center justify-between hover:border-indigo-100 dark:hover:border-white hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                    {fileIcon(note.title)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{note.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {note.question_count ?? 0} questions · Uploaded {new Date(note.created_at || Date.now()).toLocaleDateString()} · Expires {new Date(note.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/quiz/${note.id}`}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg px-3 py-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                  >
                    MCQ Quiz
                  </Link>
                  <Link
                    to={`/exam/${note.id}`}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-lg px-3 py-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
                  >
                    Mock Exam
                  </Link>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors duration-200 px-2 py-1.5"
                    title="Delete note"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </FadeIn>
      </div>
    </AppLayout>
  )
}
