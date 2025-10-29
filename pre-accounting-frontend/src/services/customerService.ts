import api from './api';
import { Invoice } from '@/types';

export const getMyInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get('/api/customer/invoices');
  return response.data;
};

export interface CreateInvoiceRequest {
  type: 'INCOME' | 'EXPENSE';
  date: string;
  amount: number;
  description?: string;
}

export const createInvoice = async (invoiceData: CreateInvoiceRequest): Promise<Invoice> => {
  const response = await api.post<Invoice>('/api/customer/invoices', invoiceData);
  return response.data;
};
