/**
 * Item (Product/Service) TypeScript types
 */

export type ItemType = 'PRODUCT' | 'SERVICE'
export type ItemStatus = 'ACTIVE' | 'PASSIVE'

export interface Item {
  id: number
  name: string
  description?: string
  type: ItemType
  category: string
  stock?: number
  salePrice: number
  purchasePrice: number
  status: ItemStatus
  companyId: number
  createdAt: string
  updatedAt: string
}

export interface CreateItemRequest {
  name: string
  description?: string
  type: ItemType
  category: string
  stock?: number
  salePrice: number
  purchasePrice: number
  status?: ItemStatus
}

export interface UpdateItemRequest {
  name: string
  description?: string
  type: ItemType
  category: string
  stock?: number
  salePrice: number
  purchasePrice: number
  status: ItemStatus
}
