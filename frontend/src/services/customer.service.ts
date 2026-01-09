/**
 * Customer/Supplier API Service
 */

import api from './api'
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '@/types/customer.types'

type ApiCustomer = {
  id: number
  name: string
  email?: string
  phone?: string
  taxNo?: string
  address?: string
  isCustomer: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

const mapApiCustomer = (data: ApiCustomer): Customer => ({
  id: data.id,
  name: data.name,
  type: data.isCustomer ? 'CUSTOMER' : 'SUPPLIER',
  email: data.email,
  phone: data.phone,
  taxNo: data.taxNo,
  address: data.address,
  active: data.active,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<ApiCustomer[]>('/api/customers')
    return response.data.map(mapApiCustomer)
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await api.get<ApiCustomer>(`/api/customers/${id}`)
    return mapApiCustomer(response.data)
  },

  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      taxNo: data.taxNo,
      address: data.address,
      isCustomer: data.type === 'CUSTOMER',
    }
    const response = await api.post<ApiCustomer>('/api/customers', payload)
    return mapApiCustomer(response.data)
  },

  update: async (id: number, data: UpdateCustomerRequest): Promise<Customer> => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      taxNo: data.taxNo,
      address: data.address,
      isCustomer: data.type === 'CUSTOMER',
      active: data.active ?? true,
    }
    const response = await api.put<ApiCustomer>(`/api/customers/${id}`, payload)
    return mapApiCustomer(response.data)
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/customers/${id}`)
  },
}
