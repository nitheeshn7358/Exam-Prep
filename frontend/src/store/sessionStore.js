import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSessionStore = create(
  persist(
    (set) => ({
      activeSession: null, // { noteId, subjectId, mode, noteTitle, current, total, answers }

      startSession: (noteId, noteTitle, mode, total, subjectId = null) =>
        set({
          activeSession: { noteId, subjectId, noteTitle, mode, current: 0, total, answers: [] },
        }),

      updateProgress: (current, answers) =>
        set((state) => ({
          activeSession: state.activeSession
            ? { ...state.activeSession, current, answers }
            : null,
        })),

      clearSession: () => set({ activeSession: null }),
    }),
    { name: 'active-session' }
  )
)

export default useSessionStore
