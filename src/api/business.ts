import client from './client'

export const getProfile = () => client.get('/business')

export const updateProfile = (data: Partial<{ name: string; phone: string; email: string }>) =>
  client.patch('/business', data)

export const deleteBusiness = () => client.delete('/business')
