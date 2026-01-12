/**
 * Invoice TypeScript types
 */

export type InvoiceStatus = 'ISSUED' | 'UNPAID' | 'PAID' | 'CANCELLED'
export type InvoiceType = 'INCOME' | 'EXPENSE'

export interface InvoiceItem {
  id: number
  itemName?: string
  description?: string
  quantity: number
  unitPrice: number
  amount?: number
  vatRate?: number
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
