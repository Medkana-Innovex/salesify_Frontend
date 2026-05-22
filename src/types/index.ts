export interface Business {
  id: string
  name: string
  phone: string
  email: string
  createdAt: string
}

export interface Branch {
  id: string
  name: string
  isActive: boolean
}

export interface Staff {
  id: string
  fullName: string
  code: string | null
  role: 'general_manager' | 'branch_manager' | 'staff'
  branchId: string | null
  branch?: { id: string; name: string }
  isActive: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  amount: string
  telebirrRef: string | null
  transactedAt: string
  createdAt: string
  branch: { id: string; name: string }
  staff: { id: string; fullName: string; code: string | null }
  tipAmount: string | null
}

export interface DashboardSummary {
  totalSales: number
  transactionCount: number
}

export interface TrendPoint {
  period: string
  total: number
  count: number
}

export interface LeaderboardEntry {
  staffId: string
  fullName: string
  totalSales: number
  transactionCount: number
}

export interface AuthUser {
  sub: string
  business_id: string
  role: string
  branch_id: string | null
}
