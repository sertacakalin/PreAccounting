import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'
import { ROUTES } from '@/config/routes'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  requireCustomer?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false, requireCustomer = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isCustomer, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  if (requireCustomer && !isCustomer) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <>{children}</>
}
