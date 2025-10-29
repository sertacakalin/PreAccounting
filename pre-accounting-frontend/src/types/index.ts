export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  role: 'ADMIN' | 'CUSTOMER';
  customerId?: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  taxNo: string;
  address: string;
  username: string;
}

export interface Invoice {
  id: number;
  customerId: number;
  customerName: string;
  type: 'INCOME' | 'EXPENSE';
  date: string; // YYYY-MM-DD
  amount: number;
  description: string;
  createdAt: string;
}

export interface SummaryReport {
  fromDate: string;
  toDate: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  invoiceCount: number;
}
