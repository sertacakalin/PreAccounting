import api from './api';
import { Account, Product, ProductCategory, Unit, TaxRate, Currency } from '@/types';

const BASE_URL = '/api/admin/master-data';

// Accounts
export const getAccounts = async (activeOnly = false): Promise<Account[]> => {
  const response = await api.get(`${BASE_URL}/accounts?activeOnly=${activeOnly}`);
  return response.data;
};

export const getAccount = async (id: number): Promise<Account> => {
  const response = await api.get(`${BASE_URL}/accounts/${id}`);
  return response.data;
};

export const createAccount = async (data: Account): Promise<Account> => {
  const response = await api.post(`${BASE_URL}/accounts`, data);
  return response.data;
};

export const updateAccount = async (id: number, data: Account): Promise<Account> => {
  const response = await api.put(`${BASE_URL}/accounts/${id}`, data);
  return response.data;
};

export const deleteAccount = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/accounts/${id}`);
};

// Products
export const getProducts = async (activeOnly = false): Promise<Product[]> => {
  const response = await api.get(`${BASE_URL}/products?activeOnly=${activeOnly}`);
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get(`${BASE_URL}/products/${id}`);
  return response.data;
};

export const createProduct = async (data: Product): Promise<Product> => {
  const response = await api.post(`${BASE_URL}/products`, data);
  return response.data;
};

export const updateProduct = async (id: number, data: Product): Promise<Product> => {
  const response = await api.put(`${BASE_URL}/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/products/${id}`);
};

// Product Categories
export const getProductCategories = async (): Promise<ProductCategory[]> => {
  const response = await api.get(`${BASE_URL}/product-categories`);
  return response.data;
};

export const createProductCategory = async (data: ProductCategory): Promise<ProductCategory> => {
  const response = await api.post(`${BASE_URL}/product-categories`, data);
  return response.data;
};

export const updateProductCategory = async (id: number, data: ProductCategory): Promise<ProductCategory> => {
  const response = await api.put(`${BASE_URL}/product-categories/${id}`, data);
  return response.data;
};

export const deleteProductCategory = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/product-categories/${id}`);
};

// Units
export const getUnits = async (): Promise<Unit[]> => {
  const response = await api.get(`${BASE_URL}/units`);
  return response.data;
};

export const createUnit = async (data: Unit): Promise<Unit> => {
  const response = await api.post(`${BASE_URL}/units`, data);
  return response.data;
};

export const updateUnit = async (id: number, data: Unit): Promise<Unit> => {
  const response = await api.put(`${BASE_URL}/units/${id}`, data);
  return response.data;
};

export const deleteUnit = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/units/${id}`);
};

// Tax Rates
export const getTaxRates = async (): Promise<TaxRate[]> => {
  const response = await api.get(`${BASE_URL}/tax-rates`);
  return response.data;
};

export const createTaxRate = async (data: TaxRate): Promise<TaxRate> => {
  const response = await api.post(`${BASE_URL}/tax-rates`, data);
  return response.data;
};

export const updateTaxRate = async (id: number, data: TaxRate): Promise<TaxRate> => {
  const response = await api.put(`${BASE_URL}/tax-rates/${id}`, data);
  return response.data;
};

export const deleteTaxRate = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/tax-rates/${id}`);
};

// Currencies
export const getCurrencies = async (): Promise<Currency[]> => {
  const response = await api.get(`${BASE_URL}/currencies`);
  return response.data;
};

export const createCurrency = async (data: Currency): Promise<Currency> => {
  const response = await api.post(`${BASE_URL}/currencies`, data);
  return response.data;
};

export const updateCurrency = async (id: number, data: Currency): Promise<Currency> => {
  const response = await api.put(`${BASE_URL}/currencies/${id}`, data);
  return response.data;
};

export const deleteCurrency = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/currencies/${id}`);
};
