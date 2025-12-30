import { createContext, useContext, useState, useEffect } from 'react'
import { getUser, setUser as saveUser, removeUser, getToken, setToken, removeToken } from '@/lib/auth'
import { authApi } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = getUser()
    if (storedUser) {
      setUserState(storedUser)
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await authApi.post('/auth/login', { username, password })
      const { token, username: userName, role } = response.data

      const userData = { username: userName, role }
      setToken(token)
      saveUser(userData)
      setUserState(userData)

      return { success: true, data: userData }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const logout = () => {
    removeToken()
    removeUser()
    setUserState(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
