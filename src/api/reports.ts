import client from './client'

export const getSummaryReport = (params?: { branchId?: string; from?: string; to?: string }) =>
  client.get('/reports/summary', { params })

export const getStaffReport = (params?: { branchId?: string; from?: string; to?: string }) =>
  client.get('/reports/staff', { params })

export const exportPdf = (params?: { branchId?: string; from?: string; to?: string }) =>
  client.get('/reports/export', { params, responseType: 'blob' })
