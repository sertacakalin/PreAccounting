/**
 * Document types for OCR processing
 */

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  VERIFIED = 'VERIFIED',
  ERROR = 'ERROR',
}

export enum DocumentType {
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  CONTRACT = 'CONTRACT',
  BANK_STATEMENT = 'BANK_STATEMENT',
  OTHER = 'OTHER',
}

export interface DocumentFields {
  // General fields
  companyName?: string
  companyNameConfidence?: number
  date?: string
  dateConfidence?: number
  documentNumber?: string
  documentNumberConfidence?: number
  totalAmount?: number
  totalAmountConfidence?: number
  vatAmount?: number
  vatAmountConfidence?: number
  currency?: string
  currencyConfidence?: number

  // Additional fields
  taxId?: string
  taxIdConfidence?: number
  address?: string
  addressConfidence?: number
  description?: string
  descriptionConfidence?: number

  // Invoice items
  items?: InvoiceItem[]

  // Overall
  overallConfidence?: number
  rawOcrText?: string
}

export interface InvoiceItem {
  name?: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
  description?: string
}

export interface Document {
  id: number
  filename: string
  contentType: string
  fileSize: number
  status: DocumentStatus
  documentType?: DocumentType
  ocrText?: string
  ocrConfidence?: number
  ocrProvider?: string
  extractedData?: string // JSON string of DocumentFields
  processingError?: string
  companyId: number
  uploadedById?: number
  uploadedByName?: string
  createdAt: string
  updatedAt: string
  processedAt?: string
}

export interface DocumentUploadResponse {
  documentId: number
  filename: string
  status: string
  message: string
}

export interface DocumentProcessingResult {
  documentId: number
  status: string
  ocrText?: string
  ocrConfidence?: number
  ocrProvider?: string
  extractedData?: string
  error?: string
  processingTimeMs: number
}
