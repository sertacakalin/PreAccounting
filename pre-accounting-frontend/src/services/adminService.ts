import api from './api';
import { Customer } from '@/types';

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

// Add other admin-related API calls here
