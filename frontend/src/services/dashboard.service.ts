/**
 * Dashboard API Service
 * Handles dashboard analytics and statistics
 */

import api from './api'
import { coerceArray } from './response'
import type {
  Dashboard,
  MonthlyIncomeExpense,
  ExpenseDistribution,
  UnpaidInvoiceSummary,
  DashboardParams,
} from '@/types/dashboard.types'

// API response types (matching backend DTOs)
type ApiDashboard = {
  totalIncome: number | string
  totalExpense: number | string
  netProfit: number | string
  totalUnpaidInvoices: number
  totalUnpaidAmount: number | string
  monthlyData: any[]
  expenseDistribution: any[]
  unpaidInvoices: any[]
}

type ApiMonthlyData = {
  month: string
  income: number | string
  expense: number | string
  profit: number | string
}

type ApiExpenseDistribution = {
  categoryName: string
  amount: number | string
  percentage: number | string
}

type ApiUnpaidInvoice = {
  id: number
  invoiceNumber: string
  customerName: string
  amount: number | string
  dueDate: string
  daysOverdue: number
}

// Helper functions
const toNumber = (value: number | string | null | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Mapping functions
const mapMonthlyData = (data: ApiMonthlyData): MonthlyIncomeExpense => ({
  month: data.month,
  income: toNumber(data.income),
  expense: toNumber(data.expense),
  profit: toNumber(data.profit),
})

const mapExpenseDistribution = (data: ApiExpenseDistribution): ExpenseDistribution => ({
  categoryName: data.categoryName,
  amount: toNumber(data.amount),
  percentage: toNumber(data.percentage),
})

const mapUnpaidInvoice = (data: ApiUnpaidInvoice): UnpaidInvoiceSummary => ({
  id: data.id,
  invoiceNumber: data.invoiceNumber,
  customerName: data.customerName,
  amount: toNumber(data.amount),
  dueDate: data.dueDate,
  daysOverdue: data.daysOverdue,
})

const mapDashboard = (data: ApiDashboard): Dashboard => ({
  totalIncome: toNumber(data.totalIncome),
  totalExpense: toNumber(data.totalExpense),
  netProfit: toNumber(data.netProfit),
  totalUnpaidInvoices: data.totalUnpaidInvoices,
  totalUnpaidAmount: toNumber(data.totalUnpaidAmount),
  monthlyData: coerceArray<ApiMonthlyData>(data.monthlyData).map(mapMonthlyData),
  expenseDistribution: coerceArray<ApiExpenseDistribution>(data.expenseDistribution)
    .map(mapExpenseDistribution),
  unpaidInvoices: coerceArray<ApiUnpaidInvoice>(data.unpaidInvoices).map(mapUnpaidInvoice),
})

// Dashboard service
export const dashboardService = {
  /**
   * Get dashboard summary with optional date filters
   */
  getDashboard: async (params?: DashboardParams): Promise<Dashboard> => {
    const response = await api.get<ApiDashboard>('/dashboard', { params })
    return mapDashboard(response.data)
  },

  /**
   * Get monthly income/expense trends
   */
  getMonthlyIncomeExpense: async (params?: DashboardParams): Promise<MonthlyIncomeExpense[]> => {
    const response = await api.get<ApiMonthlyData[]>('/dashboard/monthly', { params })
    return coerceArray<ApiMonthlyData>(response.data).map(mapMonthlyData)
  },

  /**
   * Get expense distribution by category
   */
  getExpenseDistribution: async (params?: DashboardParams): Promise<ExpenseDistribution[]> => {
    const response = await api.get<ApiExpenseDistribution[]>('/dashboard/expense-distribution', {
      params,
    })
    return coerceArray<ApiExpenseDistribution>(response.data).map(mapExpenseDistribution)
  },

  /**
   * Get unpaid invoices summary
   */
  getUnpaidInvoices: async (): Promise<UnpaidInvoiceSummary[]> => {
    const response = await api.get<ApiUnpaidInvoice[]>('/dashboard/unpaid-invoices')
    return coerceArray<ApiUnpaidInvoice>(response.data).map(mapUnpaidInvoice)
  },
}
