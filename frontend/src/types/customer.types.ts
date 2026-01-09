/**
 * Customer/Supplier TypeScript types
 */

export type CustomerType = 'CUSTOMER' | 'SUPPLIER'

export interface Customer {
  id: number
  name: string
  type: CustomerType
  email?: string
  phone?: string
  taxNo?: string
  address?: string
  active?: boolean
  companyId?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerRequest {
  name: string
  type: CustomerType
  email?: string
  phone?: string
  taxNo?: string
  address?: string
}

export interface UpdateCustomerRequest {
  name: string
  type: CustomerType
  email?: string
  phone?: string
  taxNo?: string
  address?: string
  active?: boolean
}
