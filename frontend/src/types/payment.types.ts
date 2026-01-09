export type PaymentType = 'PAYMENT' | 'COLLECTION'
export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CHEQUE'
  | 'OTHER'

export interface Payment {
  id: number
  type: PaymentType
  amount: number
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

export interface CreatePaymentRequest {
  type: PaymentType
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  notes?: string
  currency?: string
  customerSupplierId: number
  invoiceId?: number
}
