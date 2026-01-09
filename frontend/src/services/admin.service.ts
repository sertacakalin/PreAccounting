/**
 * Admin API Service
 * Handles all admin-related API calls
 */

import api from './api'
import type { UserDto, CompanyDto, CustomerDto } from '@/types/admin.types'

export const adminService = {
  // Users
  getAllUsers: async (): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>('/api/admin/users')
    return response.data
  },

  // Companies
  getAllCompanies: async (): Promise<CompanyDto[]> => {
    const response = await api.get<CompanyDto[]>('/api/admin/companies')
    return response.data
  },

  // Customers
  getAllCustomers: async (): Promise<CustomerDto[]> => {
    const response = await api.get<CustomerDto[]>('/api/admin/customers')
    return response.data
  },
}
