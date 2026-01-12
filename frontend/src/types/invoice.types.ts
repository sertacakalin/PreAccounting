export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE'

export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  id: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  currency: string
  status: InvoiceStatus
  notes?: string
  customerSupplierId: number
  customerSupplierName: string
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceItemRequest {
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateInvoiceRequest {
  invoiceDate: string
  dueDate: string
  notes?: string
  currency?: string
  customerSupplierId: number
  items: CreateInvoiceItemRequest[]
}
