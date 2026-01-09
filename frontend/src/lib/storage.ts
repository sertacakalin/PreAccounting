import type { User } from '@/types/auth.types'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
