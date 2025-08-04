import { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await api.get('/api/auth/me')  // ✅ Fixed
        setUser(response.data.user)
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password }) // ✅ Fixed
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setUser(user)
      toast.success('Login successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData) // ✅ Fixed
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setUser(user)
      toast.success('Registration successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData) // ✅ Fixed
      setUser(response.data.user)
      toast.success('Profile updated successfully!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed')
      return false
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
