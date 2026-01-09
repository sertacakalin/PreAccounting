/**
 * Item API Service
 */

import api from './api'
import type { Item, CreateItemRequest, UpdateItemRequest } from '@/types/item.types'

export const itemService = {
  getAll: async (): Promise<Item[]> => {
    const response = await api.get<Item[]>('/api/items')
    return response.data
  },

  getById: async (id: number): Promise<Item> => {
    const response = await api.get<Item>(`/api/items/${id}`)
    return response.data
  },

  create: async (data: CreateItemRequest): Promise<Item> => {
    const response = await api.post<Item>('/api/items', data)
    return response.data
  },

  update: async (id: number, data: UpdateItemRequest): Promise<Item> => {
    const response = await api.put<Item>(`/api/items/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/items/${id}`)
  },
}
