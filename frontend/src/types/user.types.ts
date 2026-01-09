export interface User {
  id: number
  username: string
  role: 'ADMIN' | 'CUSTOMER'
  companyId?: number
  companyName?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateUserRequest {
  username: string
  password: string
  role: 'ADMIN' | 'CUSTOMER'
  companyId?: number
}

export interface UpdateUserRequest {
  username?: string
  password?: string
  role?: 'ADMIN' | 'CUSTOMER'
  companyId?: number
}
