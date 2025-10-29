import api from './api';
import { SummaryReport } from '@/types';

export const getAdminSummaryReport = async (from: string, to: string): Promise<SummaryReport> => {
  const response = await api.get(`/api/admin/reports/summary?from=${from}&to=${to}`);
  return response.data;
};

export const getCustomerSummaryReport = async (from: string, to: string): Promise<SummaryReport> => {
  const response = await api.get(`/api/customer/report/summary?from=${from}&to=${to}`);
  return response.data;
};
