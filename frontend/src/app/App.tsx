/**
 * Main App Component
 * Router configuration with protected routes
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { CustomerLayout } from '@/components/customer/CustomerLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { UserManagement } from '@/pages/UserManagement'
import { CompanyManagement } from '@/pages/CompanyManagement'
import { CurrencyManagement } from '@/pages/CurrencyManagement'
import { AITemplateManagement } from '@/pages/AITemplateManagement'
import { AdminSettings } from '@/pages/AdminSettings'
import { CustomerDashboard } from '@/pages/CustomerDashboard'
import { IncomeExpensePage } from '@/pages/IncomeExpensePage'
import { ItemsPage } from '@/pages/ItemsPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { AIAssistantPage } from '@/pages/ai/AIAssistantPage'
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
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />

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
              <Route path="currencies" element={<CurrencyManagement />} />
              <Route path="ai-templates" element={<AITemplateManagement />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireCustomer>
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerDashboard />} />
              <Route path="income-expense" element={<IncomeExpensePage />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
            </Route>

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
