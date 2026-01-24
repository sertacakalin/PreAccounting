import api from './api'
import type {
  Document,
  DocumentUploadResponse,
  DocumentProcessingResult,
} from '@/types/document'

/**
 * Document service for OCR and file processing
 */
export const documentService = {
  /**
   * Upload a document
   */
  upload: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<DocumentUploadResponse>(
      '/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Process a document with OCR
   */
  process: async (documentId: number): Promise<DocumentProcessingResult> => {
    const response = await api.post<DocumentProcessingResult>(
      `/documents/${documentId}/process`
    )
    return response.data
  },

  /**
   * Upload and process a document in one step
   */
  uploadAndProcess: async (file: File): Promise<DocumentProcessingResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<DocumentProcessingResult>(
      '/documents/upload-and-process',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  /**
   * Get a document by ID
   */
  getById: async (documentId: number): Promise<Document> => {
    const response = await api.get<Document>(`/documents/${documentId}`)
    return response.data
  },

  /**
   * Get all documents
   */
  getAll: async (): Promise<Document[]> => {
    const response = await api.get<Document[]>('/documents')
    return response.data
  },

  /**
   * Get documents by status
   */
  getByStatus: async (status: string): Promise<Document[]> => {
    const response = await api.get<Document[]>(`/documents/by-status/${status}`)
    return response.data
  },

  /**
   * Delete a document
   */
  delete: async (documentId: number): Promise<void> => {
    await api.delete(`/documents/${documentId}`)
  },
}
