export const AUTH_STORAGE_KEY = 'token'
export const USER_STORAGE_KEY = 'user'

export const getToken = () => {
  return localStorage.getItem(AUTH_STORAGE_KEY)
}

export const setToken = (token) => {
  localStorage.setItem(AUTH_STORAGE_KEY, token)
}

export const removeToken = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const getUser = () => {
  const userStr = localStorage.getItem(USER_STORAGE_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const setUser = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export const removeUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY)
}

export const isAuthenticated = () => {
  return !!getToken()
}

export const hasRole = (role) => {
  const user = getUser()
  return user?.role === role
}

export const isAdmin = () => {
  return hasRole('ADMIN')
}

export const isCustomer = () => {
  return hasRole('CUSTOMER')
}
