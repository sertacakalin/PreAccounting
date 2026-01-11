/**
 * Item API Service
 */

import api from './api'
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

type ApiPage<T> = {
  content: T[]
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
  getAll: async (params?: { search?: string }): Promise<Item[]> => {
    const response = await api.get<ApiPage<ApiItem>>('/items', {
      params: params?.search ? { search: params.search } : undefined,
    })
    return response.data.content.map(mapApiItem)
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
}
