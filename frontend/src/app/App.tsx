/**
 * Main App Component
 * Router configuration with protected routes
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { LandingPage } from '@/pages/LandingPage'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { UserManagement } from '@/pages/UserManagement'
import { CompanyManagement } from '@/pages/CompanyManagement'
import { AdminSettings } from '@/pages/AdminSettings'
import { CustomerDashboard } from '@/pages/CustomerDashboard'
import { IncomeExpensePage } from '@/pages/IncomeExpensePage'
import { ItemsPage } from '@/pages/ItemsPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { ROUTES } from '@/config/routes'
import { Toaster } from 'sonner'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<LandingPage />} />

            {/* Admin Routes */}
            <Route
              path={ROUTES.ADMIN_ROOT}
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="companies" element={<CompanyManagement />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Customer Routes */}
            <Route
              path={ROUTES.CUSTOMER_DASHBOARD}
              element={
                <ProtectedRoute requireCustomer>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER_INCOME_EXPENSE}
              element={
                <ProtectedRoute requireCustomer>
                  <IncomeExpensePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER_ITEMS}
              element={
                <ProtectedRoute requireCustomer>
                  <ItemsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER_CUSTOMERS}
              element={
                <ProtectedRoute requireCustomer>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER_INVOICES}
              element={
                <ProtectedRoute requireCustomer>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CUSTOMER_PAYMENTS}
              element={
                <ProtectedRoute requireCustomer>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
