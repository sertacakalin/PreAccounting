import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoginPage } from '@/pages/LoginPage'
import { Dashboard } from '@/pages/Dashboard'
import { Placeholder } from '@/pages/Placeholder'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { UsersPage } from '@/pages/UsersPage'
import { SystemSettingsPage } from '@/pages/SystemSettingsPage'
import { AuditLogsPage } from '@/pages/AuditLogsPage'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="settings" element={<SystemSettingsPage />} />
              <Route path="audit" element={<AuditLogsPage />} />
            </Route>

            {/* Customer routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute requireCustomer>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Placeholder title="Customers & Suppliers" />} />
              <Route path="invoices" element={<Placeholder title="Invoices" />} />
              <Route path="income-expense" element={<Placeholder title="Income & Expense" />} />
              <Route path="payments" element={<Placeholder title="Payments" />} />
              <Route path="ai" element={<Placeholder title="AI Assistant" />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
