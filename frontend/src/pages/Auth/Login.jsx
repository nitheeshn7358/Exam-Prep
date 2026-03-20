import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, Lock, Eye, EyeClosed, ArrowRight } from 'lucide-react'
import api from '../../api/api'
import useAuthStore from '../../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)

  // 3D card tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }
  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })
      setToken(res.data.access_token)
      setUser(res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        const googleUser = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json())
        const res = await api.post('/auth/google', {
          credential: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
        })
        setToken(res.data.access_token)
        setUser(res.data.user)
        navigate('/dashboard')
      } catch {
        setError('Google login failed. Please try again.')
      }
    },
    onError: () => setError('Google login failed. Please try again.'),
  })

  const beamBase = 'absolute bg-gradient-to-r from-transparent via-white to-transparent opacity-70'

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">

      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/40 via-blue-800/50 to-black" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-blue-500/20 blur-[80px]" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-blue-400/20 blur-[60px]"
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-blue-500/20 blur-[60px]"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" style={{ animationDelay: '1s' }} />

      {/* Card wrapper — entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
        style={{ perspective: 1500 }}
      >
        {/* 3D tilt layer */}
        <motion.div
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
          className="relative"
        >
          <div className="relative group">

            {/* Ambient glow pulse */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                  '0 0 15px 5px rgba(255,255,255,0.05)',
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                ],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            />

            {/* Traveling light beams */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
              {/* Top */}
              <motion.div
                className={`${beamBase} top-0 left-0 h-[3px] w-[50%]`}
                animate={{ left: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ left: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror' }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror' } }}
              />
              {/* Right */}
              <motion.div
                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                animate={{ top: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ top: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 0.6 } }}
              />
              {/* Bottom */}
              <motion.div
                className={`${beamBase} bottom-0 right-0 h-[3px] w-[50%]`}
                animate={{ right: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ right: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.2 } }}
              />
              {/* Left */}
              <motion.div
                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                animate={{ bottom: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ bottom: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.8 } }}
              />

              {/* Corner sparks */}
              {[
                { cls: 'top-0 left-0 h-[5px] w-[5px] bg-white/40 blur-[1px]', delay: 0 },
                { cls: 'top-0 right-0 h-[8px] w-[8px] bg-white/60 blur-[2px]', delay: 0.5 },
                { cls: 'bottom-0 right-0 h-[8px] w-[8px] bg-white/60 blur-[2px]', delay: 1 },
                { cls: 'bottom-0 left-0 h-[5px] w-[5px] bg-white/40 blur-[1px]', delay: 1.5 },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-full ${s.cls}`}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2 + i * 0.1, repeat: Infinity, repeatType: 'mirror', delay: s.delay }}
                />
              ))}
            </div>

            {/* Glass card */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08] shadow-2xl overflow-hidden">
              {/* Gloss top sheen */}
              <div className="absolute top-0 left-0 right-0 h-[45%] rounded-t-2xl pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 100%)' }} />
              {/* Gloss top-edge highlight line */}
              <div className="absolute top-0 left-[10%] right-[10%] h-[1px] pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
              {/* Subtle inner side glow */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.03)' }} />
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)',
                  backgroundSize: '30px 30px',
                }}
              />

              {/* Header */}
              <div className="text-center space-y-1 mb-5 relative z-10">
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-sm font-semibold tracking-widest text-blue-400/80 uppercase mb-1"
                >
                  ExamPrep
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                >
                  Welcome Back
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 text-xs"
                >
                  Sign in to continue to ExamPrep
                </motion.p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl px-4 py-3 relative z-10"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div className="space-y-3">
                  {/* Email */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === 'email' ? 'text-white' : 'text-white/40'}`} />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email address"
                        required
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 rounded-lg pl-10 pr-3 text-sm focus:bg-white/10 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === 'password' ? 'text-white' : 'text-white/40'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 rounded-lg pl-10 pr-10 text-sm focus:bg-white/10 focus:outline-none transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-white/40 hover:text-white transition-colors duration-300"
                      >
                        {showPassword
                          ? <Eye className="w-4 h-4" />
                          : <EyeClosed className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Remember me + forgot */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={form.rememberMe}
                        onChange={handleChange}
                        className="appearance-none h-4 w-4 rounded border border-white/20 bg-white/5 checked:bg-white checked:border-white focus:outline-none transition-all duration-200"
                      />
                      {form.rememberMe && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center text-black pointer-events-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <span className="text-xs text-white/60">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs text-white/60 hover:text-white transition-colors duration-200">
                    Forgot password?
                  </Link>
                </div>

                {/* Sign in button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative group/button mt-1"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                  <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg flex items-center justify-center">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
                      style={{ opacity: loading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    />
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-sm font-medium">
                          Sign In
                          <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="relative flex items-center my-1">
                  <div className="flex-grow border-t border-white/5" />
                  <motion.span
                    className="mx-3 text-xs text-white/40"
                    animate={{ opacity: [0.7, 0.9, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    or
                  </motion.span>
                  <div className="flex-grow border-t border-white/5" />
                </div>

                {/* Google */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => googleLogin()}
                  className="w-full relative group/google"
                >
                  <div className="absolute inset-0 bg-white/5 rounded-lg blur opacity-0 group-hover/google:opacity-70 transition-opacity duration-300" />
                  <div className="relative overflow-hidden bg-white/5 text-white font-medium h-10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-white/80 group-hover/google:text-white transition-colors text-xs">
                      Sign in with Google
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.button>

                {/* Sign up link */}
                <motion.p
                  className="text-center text-xs text-white/60 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Don't have an account?{' '}
                  <Link to="/signup" className="relative inline-block group/signup">
                    <span className="relative z-10 text-white group-hover/signup:text-white/70 transition-colors duration-300 font-medium">
                      Sign up
                    </span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/signup:w-full transition-all duration-300" />
                  </Link>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
