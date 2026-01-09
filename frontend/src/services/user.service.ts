import api from './api'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user.types'

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/api/admin/users')
    return response.data
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/api/admin/users/${id}`)
    return response.data
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/api/admin/users', data)
    return response.data
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/api/admin/users/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`)
  },
}
