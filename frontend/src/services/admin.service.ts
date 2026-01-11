/**
 * Admin API Service
 * Handles all admin-related API calls
 */

import api from './api'
import { coerceArray } from './response'
import type { UserDto, CompanyDto, CustomerDto } from '@/types/admin.types'

export const adminService = {
  // Users
  getAllUsers: async (): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>('/admin/users')
    return coerceArray<UserDto>(response.data)
  },

  searchUsers: async (search: string): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>('/admin/users', { params: { search } })
    return coerceArray<UserDto>(response.data)
  },

  createUser: async (data: any): Promise<UserDto> => {
    const response = await api.post<UserDto>('/admin/users', data)
    return response.data
  },

  updateUser: async (id: number, data: any): Promise<UserDto> => {
    const response = await api.put<UserDto>(`/admin/users/${id}`, data)
    return response.data
  },

  updateUserCompany: async (id: number, companyId: number): Promise<UserDto> => {
    const response = await api.patch<UserDto>(`/admin/users/${id}/company`, { companyId })
    return response.data
  },

  updateUserRole: async (id: number, role: string): Promise<UserDto> => {
    const response = await api.patch<UserDto>(`/admin/users/${id}/role`, { role })
    return response.data
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  // Companies
  getAllCompanies: async (): Promise<CompanyDto[]> => {
    const response = await api.get<CompanyDto[]>('/admin/companies')
    return coerceArray<CompanyDto>(response.data)
  },

  searchCompanies: async (search: string): Promise<CompanyDto[]> => {
    const response = await api.get<CompanyDto[]>('/admin/companies', { params: { search } })
    return coerceArray<CompanyDto>(response.data)
  },

  createCompany: async (data: any): Promise<CompanyDto> => {
    const response = await api.post<CompanyDto>('/admin/companies', data)
    return response.data
  },

  updateCompany: async (id: number, data: any): Promise<CompanyDto> => {
    const response = await api.put<CompanyDto>(`/admin/companies/${id}`, data)
    return response.data
  },

  updateCompanyStatus: async (id: number, status: string): Promise<CompanyDto> => {
    const response = await api.patch<CompanyDto>(`/admin/companies/${id}/status`, { status })
    return response.data
  },

  deleteCompany: async (id: number): Promise<void> => {
    await api.delete(`/admin/companies/${id}`)
  },

  // Customers
  getAllCustomers: async (): Promise<CustomerDto[]> => {
    const response = await api.get<CustomerDto[]>('/admin/customers')
    return coerceArray<CustomerDto>(response.data)
  },

  createCustomer: async (data: any): Promise<any> => {
    const response = await api.post('/admin/customers', data)
    return response.data
  },

  // System
  resetAdminPassword: async (): Promise<void> => {
    await api.post('/admin/reset-admin-password')
  },
}
