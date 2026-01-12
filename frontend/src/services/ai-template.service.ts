/**
 * AI Template API Service
 * Handles AI template management (Admin only)
 */

import api from './api'
import { coerceArray } from './response'
import type { AITemplate, CreateAITemplateRequest, UpdateAITemplateRequest } from '@/types/ai.types'

// API response types
type ApiAITemplate = {
  id: number
  name: string
  description?: string
  promptTemplate: string
  active: boolean
  createdAt: string
  updatedAt?: string
}

// Mapping function
const mapAITemplate = (data: ApiAITemplate): AITemplate => ({
  id: data.id,
  name: data.name,
  description: data.description,
  promptTemplate: data.promptTemplate,
  active: data.active,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

// AI Template service
export const aiTemplateService = {
  /**
   * Get all AI templates
   */
  getAll: async (): Promise<AITemplate[]> => {
    const response = await api.get<ApiAITemplate[]>('/admin/ai-templates')
    return coerceArray<ApiAITemplate>(response.data).map(mapAITemplate)
  },

  /**
   * Get AI template by ID
   */
  getById: async (id: number): Promise<AITemplate> => {
    const response = await api.get<ApiAITemplate>(`/admin/ai-templates/${id}`)
    return mapAITemplate(response.data)
  },

  /**
   * Create new AI template
   */
  create: async (data: CreateAITemplateRequest): Promise<AITemplate> => {
    const response = await api.post<ApiAITemplate>('/admin/ai-templates', data)
    return mapAITemplate(response.data)
  },

  /**
   * Update AI template
   */
  update: async (id: number, data: UpdateAITemplateRequest): Promise<AITemplate> => {
    const response = await api.put<ApiAITemplate>(`/admin/ai-templates/${id}`, data)
    return mapAITemplate(response.data)
  },

  /**
   * Delete AI template
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/ai-templates/${id}`)
  },
}
