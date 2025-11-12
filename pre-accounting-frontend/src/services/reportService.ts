import api from './api';
import { SummaryReport, AIReportRequest, AIReportResponse } from '@/types';

export const getAdminSummaryReport = async (from: string, to: string): Promise<SummaryReport> => {
  const response = await api.get(`/api/admin/reports/summary?from=${from}&to=${to}`);
  return response.data;
};

export const getCustomerSummaryReport = async (from: string, to: string): Promise<SummaryReport> => {
  const response = await api.get(`/api/customer/report/summary?from=${from}&to=${to}`);
  return response.data;
};

export const generateAIReport = async (request: AIReportRequest): Promise<AIReportResponse> => {
  const response = await api.post('/api/admin/reports/ai-generate', request);
  return response.data;
};
