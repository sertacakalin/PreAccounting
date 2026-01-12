/**
 * Dashboard Types
 * Types for dashboard analytics and statistics
 */

export interface MonthlyIncomeExpense {
  month: string
  income: number
  expense: number
  profit: number
}

export interface ExpenseDistribution {
  categoryName: string
  amount: number
  percentage: number
}

export interface UnpaidInvoiceSummary {
  id: number
  invoiceNumber: string
  customerName: string
  amount: number
  dueDate: string
  daysOverdue: number
}

export interface Dashboard {
  totalIncome: number
  totalExpense: number
  netProfit: number
  totalUnpaidInvoices: number
  totalUnpaidAmount: number
  monthlyData: MonthlyIncomeExpense[]
  expenseDistribution: ExpenseDistribution[]
  unpaidInvoices: UnpaidInvoiceSummary[]
}

export interface DashboardParams {
  startDate?: string
  endDate?: string
}
