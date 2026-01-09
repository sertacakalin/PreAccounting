/**
 * Item (Product/Service) TypeScript types
 */

export interface Item {
  id: number
  name: string
  code?: string
  description?: string
  price: number
  unit?: string
  stockQuantity?: number
  companyId: number
  createdAt: string
  updatedAt: string
}

export interface CreateItemRequest {
  name: string
  code?: string
  description?: string
  price: number
  unit?: string
  stockQuantity?: number
}

export interface UpdateItemRequest {
  name: string
  code?: string
  description?: string
  price: number
  unit?: string
  stockQuantity?: number
}
