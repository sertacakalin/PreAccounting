/**
 * Admin-related TypeScript types
 */

export interface UserDto {
  id: number
  username: string
  role: 'ADMIN' | 'CUSTOMER'
  companyId?: number
  customerId?: number
  customerName?: string
  createdAt: string
}

export interface CompanyDto {
  id: number
  name: string
  email: string
  phone?: string
  taxNo?: string
  address?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}

export interface CustomerDto {
  id: number
  name: string
  email: string
  phone?: string
  taxNo?: string
  address?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  userId: number
  username: string
  createdAt: string
}
