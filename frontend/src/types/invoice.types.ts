/**
 * Invoice Types
 * Types for invoice management
 */

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED'
export type InvoiceType = 'INCOME' | 'EXPENSE'

export interface InvoiceItem {
  id: number
  itemId?: number
  itemName: string
  description?: string
  quantity: number
  unitPrice: number
  vatRate: number
  totalPrice: number
}

export interface Invoice {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  currency: string
  status: InvoiceStatus
  type: InvoiceType
  notes?: string
  customerSupplierId: number
  customerSupplierName: string
  items: InvoiceItem[]
  createdAt: string
  updatedAt?: string
}

export interface InvoiceItemRequest {
  itemId?: number
  itemName: string
  description?: string
  quantity: number
  unitPrice: number
  vatRate: number
}

export interface CreateInvoiceRequest {
  invoiceDate: string
  dueDate: string
  currency?: string
  notes?: string
  customerSupplierId: number
  items: InvoiceItemRequest[]
}

export interface UpdateInvoiceRequest {
  invoiceDate?: string
  dueDate?: string
  currency?: string
  notes?: string
  customerSupplierId?: number
  items?: InvoiceItemRequest[]
}
