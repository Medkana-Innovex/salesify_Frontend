import client from './client'

export const register = (data: { name: string; phone: string; email?: string; password: string }) =>
  client.post('/auth/register', data)

export const login = (data: { phone: string; password: string }) =>
  client.post('/auth/login', data)

export const staffLogin = (data: { phone: string; password: string }) =>
  client.post('/auth/staff-login', data)

export const logout = (refreshToken: string) =>
  client.post('/auth/logout', { refreshToken })
