import { useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'
import AnimatedPage from '../../components/AnimatedPage'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAlreadyLoggedInRedirect } from '../../context/useAlreadyLoggedInRedirect'

export default function Login() {
  const { login, demoLogin } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = () => {
    demoLogin()
    navigate('/dashboard')
  }

  useAlreadyLoggedInRedirect()

  return (
    <AnimatedPage>
      <div className="flex justify-center items-center h-[80vh]">
        <motion.form
          onSubmit={handleLogin}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="glass-card w-96 space-y-5"
        >
          <h2 className="text-3xl font-extrabold text-center logo-gradient">
            Welcome back
          </h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            disabled={loading}
          />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Button
            type="button"
            onClick={handleDemo}
            variant="secondary"
            fullWidth
            disabled={loading}
          >
            Quick demo login
          </Button>

          <p className="text-sm text-center dark:text-gray-300">
            No account?{' '}
            <Link to="/signup" className="underline">
              Create one
            </Link>
          </p>
        </motion.form>
      </div>
    </AnimatedPage>
  )
}
