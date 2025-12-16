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

export interface AIReportRequest {
  raporTuru: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  firmaUnvan?: string;
  vergiNo?: string;
  ozelSorgu?: string;
}

export interface AIReportResponse {
  raporTuru: string;
  markdownRapor: string;
  jsonOzet: string;
  basarili: boolean;
  hata?: string;
}

// Master Data Types
export type AccountType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH';
export type ProductType = 'PRODUCT' | 'SERVICE';

export interface Account {
  id?: number;
  code: string;
  name: string;
  type: AccountType;
  taxNo?: string;
  taxOffice?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  creditLimit?: number;
  balance?: number;
  active?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id?: number;
  code: string;
  name: string;
  type: ProductType;
  categoryId?: number;
  categoryName?: string;
  unitId?: number;
  unitName?: string;
  purchasePrice?: number;
  salePrice?: number;
  taxRateId?: number;
  taxRateName?: string;
  taxRateValue?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  active?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id?: number;
  code: string;
  name: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
}

export interface Unit {
  id?: number;
  code: string;
  name: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
}

export interface TaxRate {
  id?: number;
  code: string;
  name: string;
  rate: number;
  description?: string;
  active?: boolean;
  createdAt?: string;
}

export interface Currency {
  id?: number;
  code: string;
  name: string;
  symbol?: string;
  active?: boolean;
  isDefault?: boolean;
  createdAt?: string;
}
