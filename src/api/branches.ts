import client from './client'

export const listBranches = () => client.get('/branches')
export const createBranch = (name: string) => client.post('/branches', { name })
export const updateBranch = (id: string, name: string) => client.patch(`/branches/${id}`, { name })
export const activateBranch = (id: string) => client.patch(`/branches/${id}/activate`)
export const deactivateBranch = (id: string) => client.patch(`/branches/${id}/deactivate`)
export const deleteBranch = (id: string) => client.delete(`/branches/${id}`)
