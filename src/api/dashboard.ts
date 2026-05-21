import client from './client'

export const getSummary = (params?: { branchId?: string; from?: string; to?: string }) =>
  client.get('/dashboard/summary', { params })

export const getTrend = (params?: { branchId?: string; from?: string; to?: string; groupBy?: string }) =>
  client.get('/dashboard/trend', { params })

export const getLeaderboard = (params?: { branchId?: string; from?: string; to?: string; limit?: string }) =>
  client.get('/dashboard/leaderboard', { params })
