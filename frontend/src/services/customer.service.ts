/**
 * Customer/Supplier API Service
 */

import api from './api'
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer.types'

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/api/customers')
    return response.data
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await api.get<Customer>(`/api/customers/${id}`)
    return response.data
  },

  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await api.post<Customer>('/api/customers', data)
    return response.data
  },

  update: async (id: number, data: UpdateCustomerRequest): Promise<Customer> => {
    const response = await api.put<Customer>(`/api/customers/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/customers/${id}`)
  },
}
