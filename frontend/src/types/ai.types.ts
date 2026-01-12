/**
 * AI Types
 * Types for AI assistant and template management
 */

// AI Assistant types
export interface AIQueryRequest {
  query: string
}

export interface AIQueryResponse {
  response: string
  timestamp: string
  remainingDailyQueries?: number
  remainingMonthlyQueries?: number
  limitReached?: boolean
}

export interface AIUsageStats {
  dailyQueries: number
  monthlyQueries: number
  dailyLimit: number
  monthlyLimit: number
}

// AI Template types
export interface AITemplate {
  id: number
  name: string
  description?: string
  promptTemplate: string
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateAITemplateRequest {
  name: string
  description?: string
  promptTemplate: string
  active?: boolean
}

export interface UpdateAITemplateRequest {
  name?: string
  description?: string
  promptTemplate?: string
  active?: boolean
}
