import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/useAuthStore'
import { useNavigate, Link } from 'react-router-dom'
import AnimatedPage from '../../components/AnimatedPage'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAlreadyLoggedInRedirect } from '../../context/useAlreadyLoggedInRedirect'

export default function Signup() {
  const { signup, demoLogin } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDemo = () => {
    demoLogin()
    navigate('/dashboard')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signup(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useAlreadyLoggedInRedirect()

  return (
    <AnimatedPage>
      <div className="flex justify-center items-center h-[80vh]">
        <motion.form
          onSubmit={handleSignup}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="glass-card w-96 space-y-5"
        >
          <h2 className="text-2xl font-bold text-center dark:text-white">
            Sign Up
          </h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            disabled={loading}
          />
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <p className="text-sm text-center dark:text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="underline">
              Login
            </Link>
          </p>
        </motion.form>
      </div>
    </AnimatedPage>
  )
}
