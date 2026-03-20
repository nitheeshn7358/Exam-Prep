import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import useThemeStore from './store/themeStore'
import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Dashboard from './pages/Dashboard/Dashboard'
import Upload from './pages/Upload/Upload'
import Quiz from './pages/Quiz/Quiz'
import Exam from './pages/Exam/Exam'
import Results from './pages/Results/Results'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Notes from './pages/Notes/Notes'
import Practice from './pages/Practice/Practice'
import Profile from './pages/Profile/Profile'
import SessionDetail from './pages/SessionDetail/SessionDetail'
import Analytics from './pages/Analytics/Analytics'
import Plans from './pages/Plans/Plans'
import Support from './pages/Support/Support'
import Subjects from './pages/Subjects/Subjects'
import SubjectDetail from './pages/Subjects/SubjectDetail'
import QuizSubject from './pages/Quiz/QuizSubject'
import ExamSubject from './pages/Exam/ExamSubject'
import ProtectedRoute from './components/common/ProtectedRoute'

const queryClient = new QueryClient()

function AnimatedRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/quiz/:noteId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/quiz/subject/:subjectId" element={<ProtectedRoute><QuizSubject /></ProtectedRoute>} />
        <Route path="/exam/:noteId" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/exam/subject/:subjectId" element={<ProtectedRoute><ExamSubject /></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/subjects/:subjectId" element={<ProtectedRoute><SubjectDetail /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/session/:sessionId" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default function App() {
  const { dark, init } = useThemeStore()
  useEffect(() => { init(dark) }, [])

  return (
    <GoogleOAuthProvider clientId="967890373759-4auquch457doddfvcpottkf2mpsmgtq4.apps.googleusercontent.com">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
