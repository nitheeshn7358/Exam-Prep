import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout({ children, title, subtitle }) {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#f5f5f0] dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-scroll" style={{ scrollbarGutter: 'stable' }}>
          <div key={location.pathname} className="page-fade-in">
            {(title || subtitle) && (
              <div className="px-8 pt-8 pb-2">
                {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>}
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
              </div>
            )}
            <div className="px-8 py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
