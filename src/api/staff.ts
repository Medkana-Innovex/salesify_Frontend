import client from './client'

export const listStaff = () => client.get('/staff')

export const createStaff = (data: {
  fullName: string
  code: string
  pin: string
  role: string
  branchId?: string
}) => client.post('/staff', data)

export const updateStaff = (id: string, data: Partial<{ fullName: string; code: string; pin: string; branchId: string }>) =>
  client.patch(`/staff/${id}`, data)

export const activateStaff = (id: string) => client.patch(`/staff/${id}/activate`)
export const deactivateStaff = (id: string) => client.patch(`/staff/${id}/deactivate`)

export const deleteStaff = (id: string) => client.delete(`/staff/${id}`)
