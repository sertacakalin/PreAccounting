/**
 * System Settings Types
 * Types for system configuration (Admin only)
 */

export interface SystemSettings {
  id?: number
  defaultCurrency?: string
  vatRates?: number[]
  invoiceNumberFormat?: string
  aiDailyLimit?: number
  aiMonthlyLimit?: number
  createdAt?: string
  updatedAt?: string
}

export interface UpdateSystemSettingsRequest {
  defaultCurrency?: string
  vatRates?: number[]
  invoiceNumberFormat?: string
  aiDailyLimit?: number
  aiMonthlyLimit?: number
}
