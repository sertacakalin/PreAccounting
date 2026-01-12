/**
 * AI API Service
 * Handles AI assistant operations
 */

import api from './api'
import type { AIQueryResponse } from '@/types/ai.types'

// API response types
type ApiAIQueryResponse = {
  response: string
  timestamp: string
  remainingDailyQueries?: number
  remainingMonthlyQueries?: number
  limitReached?: boolean
}

// AI service
export const aiService = {
  /**
   * Send query to AI assistant
   */
  query: async (queryText: string): Promise<AIQueryResponse> => {
    const response = await api.post<ApiAIQueryResponse>('/ai/query', { query: queryText })
    return response.data
  },

  /**
   * Get AI usage statistics
   */
  getUsageStats: async (): Promise<Record<string, number>> => {
    const response = await api.get<Record<string, number>>('/ai/usage-stats')
    return response.data
  },
}
