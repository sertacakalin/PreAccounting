/**
 * Payment API Service
 */

import api from './api'
import type { Payment, CreatePaymentRequest, PaymentType, PaymentMethod } from '@/types/payment.types'

type ApiPayment = {
  id: number
  type: PaymentType
  amount: number | string
  currency: string
  paymentDate: string
  paymentMethod: PaymentMethod
  notes?: string
  customerSupplierId: number
  customerSupplierName: string
  invoiceId?: number
  invoiceNumber?: string
  createdAt: string
  updatedAt: string
}

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const mapApiPayment = (data: ApiPayment): Payment => ({
  id: data.id,
  type: data.type,
  amount: toNumber(data.amount),
  currency: data.currency,
  paymentDate: data.paymentDate,
  paymentMethod: data.paymentMethod,
  notes: data.notes,
  customerSupplierId: data.customerSupplierId,
  customerSupplierName: data.customerSupplierName,
  invoiceId: data.invoiceId,
  invoiceNumber: data.invoiceNumber,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

export const paymentService = {
  getAll: async (params?: {
    type?: PaymentType
    customerSupplierId?: number
    startDate?: string
    endDate?: string
  }): Promise<Payment[]> => {
    const response = await api.get<ApiPayment[]>('/api/payments', {
      params,
    })
    return response.data.map(mapApiPayment)
  },

  getById: async (id: number): Promise<Payment> => {
    const response = await api.get<ApiPayment>(`/api/payments/${id}`)
    return mapApiPayment(response.data)
  },

  getByInvoice: async (invoiceId: number): Promise<Payment[]> => {
    const response = await api.get<ApiPayment[]>(`/api/payments/invoice/${invoiceId}`)
    return response.data.map(mapApiPayment)
  },

  create: async (data: CreatePaymentRequest): Promise<Payment> => {
    const response = await api.post<ApiPayment>('/api/payments', data)
    return mapApiPayment(response.data)
  },
}
