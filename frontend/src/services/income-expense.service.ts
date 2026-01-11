/**
 * Income and Expense service
 * Handles income/expense and category API calls
 */

import api from './api'
import { coerceArray } from './response'
import type {
  IncomeExpense,
  CreateIncomeExpenseRequest,
  UpdateIncomeExpenseRequest,
  Category,
  CreateCategoryRequest,
} from '@/types/income-expense.types'

export const incomeExpenseService = {
  // Income/Expense CRUD
  getAll: async (params?: {
    categoryId?: number
    startDate?: string
    endDate?: string
  }): Promise<IncomeExpense[]> => {
    const response = await api.get<IncomeExpense[]>('/income-expenses', { params })
    return coerceArray<IncomeExpense>(response.data)
  },

  getById: async (id: number): Promise<IncomeExpense> => {
    const response = await api.get<IncomeExpense>(`/income-expenses/${id}`)
    return response.data
  },

  create: async (data: CreateIncomeExpenseRequest): Promise<IncomeExpense> => {
    const response = await api.post<IncomeExpense>('/income-expenses', data)
    return response.data
  },

  update: async (id: number, data: UpdateIncomeExpenseRequest): Promise<IncomeExpense> => {
    const response = await api.put<IncomeExpense>(`/income-expenses/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/income-expenses/${id}`)
  },

  /**
   * Upload receipt for income/expense
   */
  uploadReceipt: async (id: number, file: File): Promise<IncomeExpense> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<IncomeExpense>(`/income-expenses/${id}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Category management
  getIncomeCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/income')
    return coerceArray<Category>(response.data)
  },

  getExpenseCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/expense')
    return coerceArray<Category>(response.data)
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/categories', data)
    return response.data
  },
}
