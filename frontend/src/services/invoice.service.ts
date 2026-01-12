/**
 * Invoice API Service
 */

import api from './api'
import type { Invoice, CreateInvoiceRequest, InvoiceItem, InvoiceStatus } from '@/types/invoice.types'

type ApiInvoiceItem = {
  id: number
  description: string
  quantity: number | string
  unitPrice: number | string
  amount: number | string
}

type ApiInvoice = {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number | string
  currency: string
  status: InvoiceStatus
  notes?: string
  customerSupplierId: number
  customerSupplierName: string
  items: ApiInvoiceItem[]
  createdAt: string
  updatedAt: string
}

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const mapApiInvoiceItem = (data: ApiInvoiceItem): InvoiceItem => ({
  id: data.id,
  description: data.description,
  quantity: toNumber(data.quantity),
  unitPrice: toNumber(data.unitPrice),
  amount: toNumber(data.amount),
})

const mapApiInvoice = (data: ApiInvoice): Invoice => ({
  id: data.id,
  invoiceNumber: data.invoiceNumber,
  invoiceDate: data.invoiceDate,
  dueDate: data.dueDate,
  totalAmount: toNumber(data.totalAmount),
  currency: data.currency,
  status: data.status,
  notes: data.notes,
  customerSupplierId: data.customerSupplierId,
  customerSupplierName: data.customerSupplierName,
  items: data.items?.map(mapApiInvoiceItem) || [],
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

export const invoiceService = {
  getAll: async (unpaidOnly = false): Promise<Invoice[]> => {
    const response = await api.get<ApiInvoice[]>('/api/invoices', {
      params: { unpaidOnly },
    })
    return response.data.map(mapApiInvoice)
  },

  getById: async (id: number): Promise<Invoice> => {
    const response = await api.get<ApiInvoice>(`/api/invoices/${id}`)
    return mapApiInvoice(response.data)
  },

  create: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await api.post<ApiInvoice>('/api/invoices', data)
    return mapApiInvoice(response.data)
  },

  cancel: async (id: number): Promise<Invoice> => {
    const response = await api.patch<ApiInvoice>(`/api/invoices/${id}/cancel`)
    return mapApiInvoice(response.data)
  },

  markAsPaid: async (id: number): Promise<Invoice> => {
    const response = await api.patch<ApiInvoice>(`/api/invoices/${id}/mark-paid`)
    return mapApiInvoice(response.data)
  },
}
