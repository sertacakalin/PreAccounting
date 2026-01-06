/**
 * Unified API Service Layer
 * Simple, modern, and connects ALL backend endpoints
 */
import api, { authApi } from '../lib/api'

// ============================================================================
// AUTHENTICATION
// ============================================================================
export const authService = {
  login: (credentials) => authApi.post('/auth/login', credentials),
}

// ============================================================================
// DASHBOARD
// ============================================================================
export const dashboardService = {
  getDashboard: (params) => api.get('/api/dashboard', { params }),
  getMonthlyData: (params) => api.get('/api/dashboard/monthly', { params }),
  getExpenseDistribution: (params) => api.get('/api/dashboard/expense-distribution', { params }),
  getUnpaidInvoices: () => api.get('/api/dashboard/unpaid-invoices'),
}

// ============================================================================
// CUSTOMERS & SUPPLIERS
// ============================================================================
export const customerService = {
  getAll: () => api.get('/api/customers'),
  getById: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post('/api/customers', data),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  delete: (id) => api.delete(`/api/customers/${id}`),
  getStatement: (id, params) => api.get(`/api/customers/${id}/statement`, { params }),
}

// ============================================================================
// INVOICES
// ============================================================================
export const invoiceService = {
  getAll: (params) => api.get('/api/invoices', { params }),
  getById: (id) => api.get(`/api/invoices/${id}`),
  create: (data) => api.post('/api/invoices', data),
  cancel: (id) => api.patch(`/api/invoices/${id}/cancel`),
  markPaid: (id) => api.patch(`/api/invoices/${id}/mark-paid`),
}

// ============================================================================
// PAYMENTS
// ============================================================================
export const paymentService = {
  getAll: (params) => api.get('/api/payments', { params }),
  getById: (id) => api.get(`/api/payments/${id}`),
  getByInvoice: (invoiceId) => api.get(`/api/payments/invoice/${invoiceId}`),
  create: (data) => api.post('/api/payments', data),
}

// ============================================================================
// INCOME & EXPENSES
// ============================================================================
export const incomeExpenseService = {
  getAll: (params) => api.get('/api/income-expenses', { params }),
  getById: (id) => api.get(`/api/income-expenses/${id}`),
  create: (data) => api.post('/api/income-expenses', data),
  update: (id, data) => api.put(`/api/income-expenses/${id}`, data),
  delete: (id) => api.delete(`/api/income-expenses/${id}`),
  uploadReceipt: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/income-expenses/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ============================================================================
// CATEGORIES
// ============================================================================
export const categoryService = {
  // Income categories
  getAllIncome: () => api.get('/api/admin/categories/income'),
  getIncomeById: (id) => api.get(`/api/admin/categories/income/${id}`),
  createIncome: (data) => api.post('/api/admin/categories/income', data),
  updateIncome: (id, data) => api.put(`/api/admin/categories/income/${id}`, data),
  deleteIncome: (id) => api.delete(`/api/admin/categories/income/${id}`),

  // Expense categories
  getAllExpense: () => api.get('/api/admin/categories/expense'),
  getExpenseById: (id) => api.get(`/api/admin/categories/expense/${id}`),
  createExpense: (data) => api.post('/api/admin/categories/expense', data),
  updateExpense: (id, data) => api.put(`/api/admin/categories/expense/${id}`, data),
  deleteExpense: (id) => api.delete(`/api/admin/categories/expense/${id}`),
}

// ============================================================================
// CURRENCIES
// ============================================================================
export const currencyService = {
  getActive: () => api.get('/api/currencies'),
  getAll: () => api.get('/api/currencies/all'),
  create: (data) => api.post('/api/currencies', data),
  updateStatus: (id, status) => api.patch(`/api/currencies/${id}/status`, { status }),
  updateRates: (baseCurrency) => api.post(`/api/currencies/rates/update/${baseCurrency}`),
  updateAllRates: () => api.post('/api/currencies/rates/update-all'),
  convert: (params) => api.get('/api/currencies/convert', { params }),
  getRate: (params) => api.get('/api/currencies/rate', { params }),
}

// ============================================================================
// AI ASSISTANT
// ============================================================================
export const aiService = {
  query: (data) => api.post('/api/ai/query', data),
  getUsageStats: () => api.get('/api/ai/usage-stats'),
}

// ============================================================================
// AI TEMPLATES (Admin)
// ============================================================================
export const aiTemplateService = {
  getAll: () => api.get('/api/admin/ai-templates'),
  getById: (id) => api.get(`/api/admin/ai-templates/${id}`),
  create: (data) => api.post('/api/admin/ai-templates', data),
  update: (id, data) => api.put(`/api/admin/ai-templates/${id}`, data),
  delete: (id) => api.delete(`/api/admin/ai-templates/${id}`),
}

// ============================================================================
// ADMIN - SYSTEM SETTINGS
// ============================================================================
export const settingsService = {
  get: () => api.get('/api/admin/settings'),
  update: (data) => api.put('/api/admin/settings', data),
}

// ============================================================================
// ADMIN - USERS & COMPANIES
// ============================================================================
export const adminService = {
  // Users
  getAllUsers: () => api.get('/api/admin/users'),
  createUser: (data) => api.post('/api/admin/users', data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/api/admin/users/${id}/role`, { role }),
  updateUserCompany: (id, companyId) => api.patch(`/api/admin/users/${id}/company`, { companyId }),
  resetAdminPassword: (data) => api.post('/api/admin/reset-admin-password', data),

  // Companies
  getAllCompanies: () => api.get('/api/admin/companies'),
  createCompany: (data) => api.post('/api/admin/companies', data),
  updateCompanyStatus: (id, status) => api.patch(`/api/admin/companies/${id}/status`, { status }),

  // Customers (Admin view)
  getAllCustomers: () => api.get('/api/admin/customers'),
  createCustomer: (data) => api.post('/api/admin/customers', data),

  // Reports
  getSummaryReport: (params) => api.get('/api/admin/reports/summary', { params }),
}

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================
export default {
  auth: authService,
  dashboard: dashboardService,
  customers: customerService,
  invoices: invoiceService,
  payments: paymentService,
  incomeExpense: incomeExpenseService,
  categories: categoryService,
  currencies: currencyService,
  ai: aiService,
  aiTemplates: aiTemplateService,
  settings: settingsService,
  admin: adminService,
}
