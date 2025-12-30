import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children, requireAdmin, requireCustomer }) {
  const { isAuthenticated, isAdmin, isCustomer, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/app/dashboard" replace />
  }

  if (requireCustomer && !isCustomer) {
    return <Navigate to="/admin/users" replace />
  }

  return children
}
