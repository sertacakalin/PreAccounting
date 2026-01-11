/**
 * Item API Service
 */

import api from './api'
import { coerceArray } from './response'
import type { Item, CreateItemRequest, UpdateItemRequest, ItemStatus, ItemType } from '@/types/item.types'

type ApiItem = {
  id: number
  name: string
  description?: string
  type: ItemType
  category: string
  stock?: number | string | null
  salePrice: number | string
  purchasePrice: number | string
  status: ItemStatus
  companyId: number
  createdAt: string
  updatedAt: string
}

const toNumber = (value: number | string | null | undefined): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const mapApiItem = (data: ApiItem): Item => ({
  id: data.id,
  name: data.name,
  description: data.description,
  type: data.type,
  category: data.category,
  stock: toNumber(data.stock),
  salePrice: toNumber(data.salePrice) ?? 0,
  purchasePrice: toNumber(data.purchasePrice) ?? 0,
  status: data.status,
  companyId: data.companyId,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

export const itemService = {
  getAll: async (params?: {
    search?: string
    page?: number
    size?: number
    status?: ItemStatus
    type?: ItemType
    category?: string
  }): Promise<Item[]> => {
    const response = await api.get<ApiItem[] | { content: ApiItem[] }>('/items', { params })
    return coerceArray<ApiItem>(response.data).map(mapApiItem)
  },

  getById: async (id: number): Promise<Item> => {
    const response = await api.get<ApiItem>(`/items/${id}`)
    return mapApiItem(response.data)
  },

  create: async (data: CreateItemRequest): Promise<Item> => {
    const response = await api.post<ApiItem>('/items', data)
    return mapApiItem(response.data)
  },

  update: async (id: number, data: UpdateItemRequest): Promise<Item> => {
    const response = await api.put<ApiItem>(`/items/${id}`, data)
    return mapApiItem(response.data)
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`)
  },

  /**
   * Get only active items (for dropdowns)
   */
  getActive: async (): Promise<Item[]> => {
    const response = await api.get<ApiItem[]>('/items/active')
    return coerceArray<ApiItem>(response.data).map(mapApiItem)
  },

  /**
   * Get unique item categories
   */
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/items/categories')
    return coerceArray<string>(response.data)
  },

  /**
   * Activate item (set status to ACTIVE)
   */
  activate: async (id: number): Promise<Item> => {
    const response = await api.patch<ApiItem>(`/items/${id}/activate`)
    return mapApiItem(response.data)
  },

  /**
   * Deactivate item (set status to PASSIVE)
   */
  deactivate: async (id: number): Promise<Item> => {
    const response = await api.patch<ApiItem>(`/items/${id}/deactivate`)
    return mapApiItem(response.data)
  },
}
