import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((state) => {
        const next = !state.dark
        if (next) {
          document.documentElement.classList.add('dark')
          document.body.style.backgroundColor = '#030712'
        } else {
          document.documentElement.classList.remove('dark')
          document.body.style.backgroundColor = '#f9fafb'
        }
        return { dark: next }
      }),
      init: (dark) => {
        if (dark) {
          document.documentElement.classList.add('dark')
          document.body.style.backgroundColor = '#030712'
        } else {
          document.documentElement.classList.remove('dark')
          document.body.style.backgroundColor = '#f9fafb'
        }
      }
    }),
    { name: 'theme' }
  )
)

export default useThemeStore
