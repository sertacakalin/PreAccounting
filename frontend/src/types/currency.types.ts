/**
 * Currency Types
 * Types for currency and exchange rate management
 */

export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  isActive: boolean
}

export interface ExchangeRate {
  fromCurrency: string
  toCurrency: string
  rate: number
  date: string
}

export interface CurrencyConversion {
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  rate: number
  date: string
}

export interface CreateCurrencyRequest {
  code: string
  name: string
  symbol: string
  isActive?: boolean
}

export interface UpdateCurrencyStatusRequest {
  isActive: boolean
}
