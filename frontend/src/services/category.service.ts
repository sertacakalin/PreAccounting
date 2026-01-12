/**
 * Category API Service
 * Handles category operations (extracted from income-expense service)
 */

import api from './api'
import { coerceArray } from './response'
import type { Category, CreateCategoryRequest, CategoryType } from '@/types/income-expense.types'

// Category service
export const categoryService = {
  /**
   * Get all categories (both income and expense)
   */
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories')
    return coerceArray<Category>(response.data)
  },

  /**
   * Get categories by type
   */
  getByType: async (type: CategoryType): Promise<Category[]> => {
    const endpoint = type === 'INCOME' ? '/categories/income' : '/categories/expense'
    const response = await api.get<Category[]>(endpoint)
    return coerceArray<Category>(response.data)
  },

  /**
   * Get income categories
   */
  getIncomeCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/income')
    return coerceArray<Category>(response.data)
  },

  /**
   * Get expense categories
   */
  getExpenseCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/expense')
    return coerceArray<Category>(response.data)
  },

  /**
   * Create new category
   */
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/categories', data)
    return response.data
  },
}
