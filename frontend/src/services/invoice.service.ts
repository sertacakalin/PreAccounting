/**
 * Invoice API Service
 * Handles invoice operations
 */

import api from './api'
import { coerceArray } from './response'
import type { Invoice, InvoiceItem, CreateInvoiceRequest } from '@/types/invoice.types'

// API response types (matching backend DTOs)
type ApiInvoiceItem = {
  id: number
  itemId?: number
  itemName: string
  description?: string
  quantity: number | string
  unitPrice: number | string
  vatRate: number | string
  totalPrice: number | string
}

type ApiInvoice = {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number | string
  currency: string
  status: string
  type: string
  notes?: string
  customerSupplierId: number
  customerSupplierName: string
  items: ApiInvoiceItem[]
  createdAt: string
  updatedAt?: string
}

// Helper functions for type conversion
const toNumber = (value: number | string | null | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Mapping functions: API response → Frontend type
const mapApiInvoiceItem = (data: ApiInvoiceItem): InvoiceItem => ({
  id: data.id,
  itemId: data.itemId,
  itemName: data.itemName,
  description: data.description,
  quantity: toNumber(data.quantity),
  unitPrice: toNumber(data.unitPrice),
  vatRate: toNumber(data.vatRate),
  totalPrice: toNumber(data.totalPrice),
})

const mapApiInvoice = (data: ApiInvoice): Invoice => ({
  id: data.id,
  invoiceNumber: data.invoiceNumber,
  invoiceDate: data.invoiceDate,
  dueDate: data.dueDate,
  totalAmount: toNumber(data.totalAmount),
  currency: data.currency,
  status: data.status as any,
  type: data.type as any,
  notes: data.notes,
  customerSupplierId: data.customerSupplierId,
  customerSupplierName: data.customerSupplierName,
  items: coerceArray<ApiInvoiceItem>(data.items).map(mapApiInvoiceItem),
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})

// Invoice service
export const invoiceService = {
  /**
   * Get all invoices with optional filter
   */
  getAll: async (params?: { unpaidOnly?: boolean }): Promise<Invoice[]> => {
    const response = await api.get<ApiInvoice[]>('/invoices', { params })
    return coerceArray<ApiInvoice>(response.data).map(mapApiInvoice)
  },

  /**
   * Get invoice by ID
   */
  getById: async (id: number): Promise<Invoice> => {
    const response = await api.get<ApiInvoice>(`/invoices/${id}`)
    return mapApiInvoice(response.data)
  },

  /**
   * Create new invoice
   */
  create: async (data: CreateInvoiceRequest): Promise<Invoice> => {
    const response = await api.post<ApiInvoice>('/invoices', data)
    return mapApiInvoice(response.data)
  },

  /**
   * Cancel invoice
   */
  cancel: async (id: number): Promise<Invoice> => {
    const response = await api.patch<ApiInvoice>(`/invoices/${id}/cancel`)
    return mapApiInvoice(response.data)
  },

  /**
   * Mark invoice as paid
   */
  markAsPaid: async (id: number): Promise<Invoice> => {
    const response = await api.patch<ApiInvoice>(`/invoices/${id}/mark-paid`)
    return mapApiInvoice(response.data)
  },

  /**
   * Download invoice as PDF
   */
  downloadPdf: async (id: number, invoiceNumber: string): Promise<void> => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    })

    // Create a blob and download it
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
