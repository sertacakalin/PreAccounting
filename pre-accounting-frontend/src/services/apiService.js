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
  getDashboard: (params) => api.get('/dashboard', { params }),
  getMonthlyData: (params) => api.get('/dashboard/monthly', { params }),
  getExpenseDistribution: (params) => api.get('/dashboard/expense-distribution', { params }),
  getUnpaidInvoices: () => api.get('/dashboard/unpaid-invoices'),
}

// ============================================================================
// CUSTOMERS & SUPPLIERS
// ============================================================================
export const customerService = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getStatement: (id, params) => api.get(`/customers/${id}/statement`, { params }),
}

// ============================================================================
// INVOICES
// ============================================================================
export const invoiceService = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  cancel: (id) => api.patch(`/invoices/${id}/cancel`),
  markPaid: (id) => api.patch(`/invoices/${id}/mark-paid`),
}

// ============================================================================
// PAYMENTS
// ============================================================================
export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  getByInvoice: (invoiceId) => api.get(`/payments/invoice/${invoiceId}`),
  create: (data) => api.post('/payments', data),
}

// ============================================================================
// INCOME & EXPENSES
// ============================================================================
export const incomeExpenseService = {
  getAll: (params) => api.get('/income-expenses', { params }),
  getById: (id) => api.get(`/income-expenses/${id}`),
  create: (data) => api.post('/income-expenses', data),
  update: (id, data) => api.put(`/income-expenses/${id}`, data),
  delete: (id) => api.delete(`/income-expenses/${id}`),
  uploadReceipt: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/income-expenses/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ============================================================================
// CATEGORIES
// ============================================================================
export const categoryService = {
  // Income categories
  getAllIncome: () => api.get('/admin/categories/income'),
  getIncomeById: (id) => api.get(`/admin/categories/income/${id}`),
  createIncome: (data) => api.post('/admin/categories/income', data),
  updateIncome: (id, data) => api.put(`/admin/categories/income/${id}`, data),
  deleteIncome: (id) => api.delete(`/admin/categories/income/${id}`),

  // Expense categories
  getAllExpense: () => api.get('/admin/categories/expense'),
  getExpenseById: (id) => api.get(`/admin/categories/expense/${id}`),
  createExpense: (data) => api.post('/admin/categories/expense', data),
  updateExpense: (id, data) => api.put(`/admin/categories/expense/${id}`, data),
  deleteExpense: (id) => api.delete(`/admin/categories/expense/${id}`),
}

// ============================================================================
// CURRENCIES
// ============================================================================
export const currencyService = {
  getActive: () => api.get('/currencies'),
  getAll: () => api.get('/currencies/all'),
  create: (data) => api.post('/currencies', data),
  updateStatus: (id, status) => api.patch(`/currencies/${id}/status`, { status }),
  updateRates: (baseCurrency) => api.post(`/currencies/rates/update/${baseCurrency}`),
  updateAllRates: () => api.post('/currencies/rates/update-all'),
  convert: (params) => api.get('/currencies/convert', { params }),
  getRate: (params) => api.get('/currencies/rate', { params }),
}

// ============================================================================
// AI ASSISTANT
// ============================================================================
export const aiService = {
  query: (data) => api.post('/ai/query', data),
  getUsageStats: () => api.get('/ai/usage-stats'),
}

// ============================================================================
// AI TEMPLATES (Admin)
// ============================================================================
export const aiTemplateService = {
  getAll: () => api.get('/admin/ai-templates'),
  getById: (id) => api.get(`/admin/ai-templates/${id}`),
  create: (data) => api.post('/admin/ai-templates', data),
  update: (id, data) => api.put(`/admin/ai-templates/${id}`, data),
  delete: (id) => api.delete(`/admin/ai-templates/${id}`),
}

// ============================================================================
// ADMIN - SYSTEM SETTINGS
// ============================================================================
export const settingsService = {
  get: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
}

// ============================================================================
// ADMIN - USERS & COMPANIES
// ============================================================================
export const adminService = {
  // Users
  getAllUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserCompany: (id, companyId) => api.patch(`/admin/users/${id}/company`, { companyId }),
  resetAdminPassword: (data) => api.post('/admin/reset-admin-password', data),

  // Companies
  getAllCompanies: () => api.get('/admin/companies'),
  createCompany: (data) => api.post('/admin/companies', data),
  updateCompanyStatus: (id, status) => api.patch(`/admin/companies/${id}/status`, { status }),

  // Customers (Admin view)
  getAllCustomers: () => api.get('/admin/customers'),
  createCustomer: (data) => api.post('/admin/customers', data),

  // Reports
  getSummaryReport: (params) => api.get('/admin/reports/summary', { params }),
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
