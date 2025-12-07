import api from './api';
import { Customer, Invoice } from '@/types';

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get('/api/admin/customers');
  return response.data;
};

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  taxNo?: string;
  address?: string;
}

export interface CreateCustomerResponse {
    customerId: number;
    userId: number;
    username: string;
    password: string; // This is important to show to the admin
    name: string;
    email: string;
}

export const createCustomer = async (customerData: CreateCustomerRequest): Promise<CreateCustomerResponse> => {
  const response = await api.post<CreateCustomerResponse>('/api/admin/customers', customerData);
  return response.data;
};

export interface DashboardStats {
  totalCustomers: number;
  totalInvoices: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

// Get all invoices for admin (across all customers)
export const getAdminInvoices = async (customerId?: number): Promise<Invoice[]> => {
  const url = customerId
    ? `/api/admin/invoices?customerId=${customerId}`
    : '/api/admin/invoices';
  const response = await api.get(url);
  return response.data;
};

// Delete a customer
export const deleteCustomer = async (customerId: number): Promise<void> => {
  await api.delete(`/api/admin/customers/${customerId}`);
};
