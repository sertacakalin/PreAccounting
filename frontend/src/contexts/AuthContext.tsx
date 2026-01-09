/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/auth.service'
import { getUser, setUser as storeUser, getToken, setToken, clearAuth } from '@/lib/storage'
import type { User, LoginCredentials } from '@/types/auth.types'
import { ROUTES } from '@/config/routes'
import { toast } from 'sonner'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  isAdmin: boolean
  isCustomer: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Restore auth state from localStorage on mount
    const storedUser = getUser<User>()
    const token = getToken()

    if (storedUser && token) {
      setUserState(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials)

      // Store token and user data
      setToken(response.token)
      const userData: User = {
        username: response.username,
        role: response.role,
      }
      storeUser(userData)
      setUserState(userData)

      // Show success message
      toast.success(`Welcome back, ${response.username}!`)

      // Redirect based on role
      if (response.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD)
      } else if (response.role === 'CUSTOMER') {
        navigate(ROUTES.CUSTOMER_DASHBOARD)
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      const errorMessage = error.response?.data?.message || 'Invalid username or password'
      toast.error(errorMessage)
      throw error // Re-throw for component to handle
    }
  }

  const logout = () => {
    clearAuth()
    setUserState(null)
    toast.info('You have been logged out')
    navigate(ROUTES.HOME)
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
