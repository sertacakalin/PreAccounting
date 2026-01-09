/**
 * Income and Expense service
 * Handles income/expense and category API calls
 */

import api from './api'
import type {
  IncomeExpense,
  CreateIncomeExpenseRequest,
  UpdateIncomeExpenseRequest,
  Category,
  CreateCategoryRequest,
} from '@/types/income-expense.types'

export const incomeExpenseService = {
  // Income/Expense CRUD
  getAll: async (): Promise<IncomeExpense[]> => {
    const response = await api.get<IncomeExpense[]>('/api/income-expenses')
    return response.data
  },

  getById: async (id: number): Promise<IncomeExpense> => {
    const response = await api.get<IncomeExpense>(`/api/income-expenses/${id}`)
    return response.data
  },

  create: async (data: CreateIncomeExpenseRequest): Promise<IncomeExpense> => {
    const response = await api.post<IncomeExpense>('/api/income-expenses', data)
    return response.data
  },

  update: async (id: number, data: UpdateIncomeExpenseRequest): Promise<IncomeExpense> => {
    const response = await api.put<IncomeExpense>(`/api/income-expenses/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/income-expenses/${id}`)
  },

  // Category management
  getIncomeCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/categories/income')
    return response.data
  },

  getExpenseCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/categories/expense')
    return response.data
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/api/categories', data)
    return response.data
  },
}
