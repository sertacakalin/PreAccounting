/**
 * Currency API Service
 * Handles currency and exchange rate operations
 */

import api from './api'
import { coerceArray } from './response'
import type {
  Currency,
  CurrencyConversion,
  CreateCurrencyRequest,
} from '@/types/currency.types'

// API response types
type ApiCurrency = {
  id: number
  code: string
  name: string
  symbol: string
  isActive: boolean
}

type ApiCurrencyConversion = {
  fromCurrency: string
  toCurrency: string
  fromAmount: number | string
  toAmount: number | string
  rate: number | string
  date: string
}

// Helper functions
const toNumber = (value: number | string | null | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Mapping functions
const mapCurrency = (data: ApiCurrency): Currency => ({
  id: data.id,
  code: data.code,
  name: data.name,
  symbol: data.symbol,
  isActive: data.isActive,
})

const mapCurrencyConversion = (data: ApiCurrencyConversion): CurrencyConversion => ({
  fromCurrency: data.fromCurrency,
  toCurrency: data.toCurrency,
  fromAmount: toNumber(data.fromAmount),
  toAmount: toNumber(data.toAmount),
  rate: toNumber(data.rate),
  date: data.date,
})

// Currency service
export const currencyService = {
  /**
   * Get all active currencies
   */
  getAll: async (): Promise<Currency[]> => {
    const response = await api.get<ApiCurrency[]>('/currencies')
    return coerceArray<ApiCurrency>(response.data).map(mapCurrency)
  },

  /**
   * Get all currencies (including inactive) - Admin only
   */
  getAllCurrencies: async (): Promise<Currency[]> => {
    const response = await api.get<ApiCurrency[]>('/currencies/all')
    return coerceArray<ApiCurrency>(response.data).map(mapCurrency)
  },

  /**
   * Create new currency - Admin only
   */
  create: async (data: CreateCurrencyRequest): Promise<Currency> => {
    const response = await api.post<ApiCurrency>('/currencies', data)
    return mapCurrency(response.data)
  },

  /**
   * Update currency status - Admin only
   */
  updateStatus: async (id: number, isActive: boolean): Promise<Currency> => {
    const response = await api.patch<ApiCurrency>(`/currencies/${id}/status`, { isActive })
    return mapCurrency(response.data)
  },

  /**
   * Update exchange rates for a base currency - Admin only
   */
  updateRates: async (baseCurrency: string): Promise<void> => {
    await api.post(`/currencies/rates/update/${baseCurrency}`)
  },

  /**
   * Update all exchange rates - Admin only
   */
  updateAllRates: async (): Promise<void> => {
    await api.post('/currencies/rates/update-all')
  },

  /**
   * Convert currency amount
   */
  convert: async (
    from: string,
    to: string,
    amount: number,
    date?: string
  ): Promise<CurrencyConversion> => {
    const params: any = { from, to, amount }
    if (date) params.date = date
    const response = await api.get<ApiCurrencyConversion>('/currencies/convert', { params })
    return mapCurrencyConversion(response.data)
  },

  /**
   * Get exchange rate between two currencies
   */
  getRate: async (from: string, to: string, date?: string): Promise<number> => {
    const params: any = { from, to }
    if (date) params.date = date
    const response = await api.get<{ rate: number | string }>('/currencies/rate', { params })
    return toNumber(response.data.rate)
  },
}
