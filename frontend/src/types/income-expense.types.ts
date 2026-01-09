export type CategoryType = 'INCOME' | 'EXPENSE'

export interface Category {
  id: number
  name: string
  type: CategoryType
  companyId: number
  createdAt: string
  updatedAt: string
}

export interface IncomeExpense {
  id: number
  amount: number
  description: string
  date: string
  categoryId: number
  category?: Category
  companyId: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
}

export interface CreateIncomeExpenseRequest {
  amount: number
  description?: string
  date: string
  categoryId: number
}

export interface UpdateIncomeExpenseRequest {
  amount?: number
  description?: string
  date?: string
  categoryId?: number
}
