export interface Company {
  id: number
  name: string
  email?: string
  phone?: string
  taxNo?: string
  address?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt?: string
}

export interface CreateCompanyRequest {
  name: string
  email?: string
  phone?: string
  taxNo?: string
  address?: string
}

export interface UpdateCompanyRequest {
  name?: string
  email?: string
  phone?: string
  taxNo?: string
  address?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}
