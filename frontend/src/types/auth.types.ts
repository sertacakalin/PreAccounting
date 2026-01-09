export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'USER'
  companyId?: number
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
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
  user: User
}
