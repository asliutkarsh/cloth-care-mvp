import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('authUser'))
    if (savedUser) setUser(savedUser)
    // Ensure at least one demo user exists for quick login during development
    const users = JSON.parse(localStorage.getItem('users')) || []
    if (!users.find((u) => u.email === 'demo@cloth.com')) {
      const demo = {
        name: 'Demo User',
        email: 'demo@cloth.com',
        password: 'demo123',
      }
      localStorage.setItem('users', JSON.stringify([demo, ...users]))
    }
  }, [])

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || []
    if (users.find((u) => u.email === email)) {
      throw new Error('User already exists')
    }
    const newUser = { name, email, password }
    localStorage.setItem('users', JSON.stringify([...users, newUser]))
    localStorage.setItem('authUser', JSON.stringify(newUser))
    setUser(newUser)
  }

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || []
    const found = users.find(
      (u) => u.email === email && u.password === password
    )
    if (!found) throw new Error('Invalid credentials')
    localStorage.setItem('authUser', JSON.stringify(found))
    setUser(found)
  }

  // helper to login demo user programmatically
  const demoLogin = () => {
    try {
      login('demo@cloth.com', 'demo123')
    } catch (err) {
      console.error('Demo login failed', err)
    }
  }

  const logout = () => {
    localStorage.removeItem('authUser')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
