import api from './api'
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from '@/types/company.types'

export const companyService = {
  getAll: async (): Promise<Company[]> => {
    const response = await api.get<Company[]>('/admin/companies')
    return response.data
  },

  getById: async (id: number): Promise<Company> => {
    const response = await api.get<Company>(`/admin/companies/${id}`)
    return response.data
  },

  create: async (data: CreateCompanyRequest): Promise<Company> => {
    const response = await api.post<Company>('/admin/companies', data)
    return response.data
  },

  update: async (id: number, data: UpdateCompanyRequest): Promise<Company> => {
    const response = await api.put<Company>(`/admin/companies/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/companies/${id}`)
  },
}
