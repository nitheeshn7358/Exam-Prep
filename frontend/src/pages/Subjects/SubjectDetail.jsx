import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import FadeIn from '../../components/common/FadeIn'

export default function SubjectDetail() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [examCount, setExamCount] = useState(20)

  useEffect(() => {
    api.get(`/subjects/${subjectId}`)
      .then(res => setSubject(res.data))
      .catch(() => navigate('/subjects'))
      .finally(() => setLoading(false))
  }, [subjectId])

  const handleRemoveNote = async (noteId) => {
    if (!confirm('Remove this note from the subject?')) return
    try {
      // Unlink by patching note's subject_id to null — we'll handle this via delete note endpoint
      // For now we just remove from UI after deleting
      await api.delete(`/notes/${noteId}`)
      setSubject(prev => ({
        ...prev,
        notes: prev.notes.filter(n => n.id !== noteId),
        note_count: prev.note_count - 1,
      }))
    } catch {
      alert('Failed to remove note.')
    }
  }

  const fileIcon = (title) => {
    const ext = title?.toLowerCase()
    if (ext?.endsWith('.pdf')) return '📄'
    if (ext?.endsWith('.docx')) return '📝'
    return '📃'
  }

  if (loading) {
    return (
      <AppLayout title="Subject" subtitle="">
        <div className="text-center py-20 text-gray-400">Loading...</div>
      </AppLayout>
    )
  }

  if (!subject) return null

  return (
    <AppLayout
      title={subject.name}
      subtitle={subject.description || `${subject.note_count} notes · ${subject.question_count} questions`}
    >
      <div className="max-w-3xl space-y-6">

        {/* Stats row */}
        <FadeIn>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Notes uploaded', value: subject.note_count, color: 'indigo' },
              { label: 'Total questions', value: subject.question_count, color: 'purple' },
              { label: 'Ready to test', value: subject.question_count > 0 ? 'Yes' : 'No', color: 'green' },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 shadow-sm text-center">
                <p className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Practice buttons */}
        {subject.question_count > 0 && (
          <FadeIn delay={100}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Practice this Subject</h3>

              <div className="flex items-center gap-3 mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Questions per session:</label>
                <input
                  type="range"
                  min={5}
                  max={Math.min(subject.question_count, 50)}
                  step={5}
                  value={examCount}
                  onChange={e => setExamCount(Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="text-indigo-600 font-bold text-sm w-6 text-right">{Math.min(examCount, subject.question_count)}</span>
              </div>

              <div className="flex gap-3">
                <Link
                  to={`/quiz/subject/${subjectId}?limit=${examCount}`}
                  className="flex-1 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl py-2.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                >
                  MCQ Quiz
                </Link>
                <Link
                  to={`/exam/subject/${subjectId}?limit=${examCount}`}
                  className="flex-1 text-center text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl py-2.5 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
                >
                  Mock Exam
                </Link>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Notes list */}
        <FadeIn delay={150}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Uploaded Notes</h3>
              <Link
                to={`/upload?subject=${subjectId}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg px-3 py-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Note
              </Link>
            </div>

            {subject.notes.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-14 text-center">
                <p className="text-gray-600 dark:text-gray-400 font-medium">No notes yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">Upload chapter notes to build your question pool</p>
                <Link
                  to={`/upload?subject=${subjectId}`}
                  className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Upload first note
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {subject.notes.map(note => (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-4 flex items-center justify-between hover:border-indigo-100 dark:hover:border-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{fileIcon(note.title)}</div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{note.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {note.question_count} questions · Uploaded {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/quiz/${note.id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg px-3 py-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                      >
                        Quiz
                      </Link>
                      <button
                        onClick={() => handleRemoveNote(note.id)}
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
          </div>
        </FadeIn>
      </div>
    </AppLayout>
  )
}
