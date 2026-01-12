/**
 * Invoice Service
 * Temporary placeholder - implement actual invoice operations
 */

import api from './api'

export const invoiceService = {
  getAll: async (params?: any) => {
    const response = await api.get('/invoices', { params })
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/invoices', data)
    return response.data
  },

  cancel: async (id: number) => {
    const response = await api.post(`/invoices/${id}/cancel`)
    return response.data
  },

  markAsPaid: async (id: number) => {
    const response = await api.post(`/invoices/${id}/mark-paid`)
    return response.data
  },

  downloadPdf: async (id: number, invoiceNumber: string) => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `invoice-${invoiceNumber}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
