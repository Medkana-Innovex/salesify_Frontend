import client from './client'

export const listTransactions = (params?: { branchId?: string; staffId?: string; from?: string; to?: string }) =>
  client.get('/transactions', { params })

export const getTransaction = (id: string) => client.get(`/transactions/${id}`)
