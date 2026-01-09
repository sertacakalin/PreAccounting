export interface User {
  id: number
  username: string
  role: 'ADMIN' | 'CUSTOMER'
  customerId?: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  companyName?: string
}

export interface AuthResponse {
  token: string
  userId: number
  username: string
  role: 'ADMIN' | 'CUSTOMER'
  customerId?: number
}
