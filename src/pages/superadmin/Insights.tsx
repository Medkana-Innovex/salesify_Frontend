import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, GitBranch, Users, Receipt, CheckCircle, XCircle, Gift } from 'lucide-react'
import { saGetInsights } from '../../api/superadmin'
import SuperAdminLayout from '../../components/layout/SuperAdminLayout'

interface Insights {
  totalBusinesses: number
  totalBranches: number
  totalStaff: number
  totalTransactions: number
  totalRevenue: number
  totalFeesCollected: number
  feeTransactionCount: number
  noFeeTransactionCount: number
  totalTipsCollected: number
  tipTransactionCount: number
}

function fmt(n: number) {
  return n.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function SuperAdminInsights() {
  const navigate = useNavigate()
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    saGetInsights()
      .then((res) => setInsights(res.data))
      .catch((err) => { if (err.response?.status === 401) navigate('/superadmin/login') })
      .finally(() => setLoading(false))
  }, [])

  return (
    <SuperAdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <p className="text-sm text-gray-400 mt-0.5">Platform-wide performance</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : insights && (
        <>
          {/* Hero */}
          <div className="rounded-2xl p-5 mb-4 overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #557d24 0%, #8dc63f 100%)' }}>
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/10 translate-x-12 -translate-y-12" />
            <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Salesify Revenue</p>
            <p className="text-white text-3xl md:text-4xl font-bold mb-4">ETB {fmt(insights.totalFeesCollected)}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              <div>
                <p className="text-white/60 text-xs">Transaction Volume</p>
                <p className="text-white font-bold text-base md:text-lg">ETB {fmt(insights.totalRevenue)}</p>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div>
                <p className="text-white/60 text-xs">Transactions</p>
                <p className="text-white font-bold text-base md:text-lg">{insights.totalTransactions}</p>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div>
                <p className="text-white/60 text-xs">Tips Collected</p>
                <p className="text-white font-bold text-base md:text-lg">ETB {fmt(insights.totalTipsCollected)}</p>
              </div>
            </div>
          </div>

          {/* Platform entities */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
            {[
              { icon: Building2, label: 'Businesses', value: insights.totalBusinesses },
              { icon: GitBranch, label: 'Branches', value: insights.totalBranches },
              { icon: Users, label: 'Staff', value: insights.totalStaff },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-3 md:p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-lemon-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-lemon-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Fee breakdown */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Receipt size={13} className="text-lemon-600" /> Fee Breakdown
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 md:gap-3 bg-green-50 rounded-xl px-3 md:px-4 py-3">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">With Fee</p>
                  <p className="text-lg font-bold text-gray-900">{insights.feeTransactionCount}</p>
                  <p className="text-xs text-gray-400">transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 bg-gray-50 rounded-xl px-3 md:px-4 py-3">
                <XCircle size={16} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">No Fee</p>
                  <p className="text-lg font-bold text-gray-900">{insights.noFeeTransactionCount}</p>
                  <p className="text-xs text-gray-400">transactions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gift size={13} className="text-lemon-600" /> Tips
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Tips Collected</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">ETB {fmt(insights.totalTipsCollected)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Tip Transactions</p>
                <p className="text-xl md:text-2xl font-bold text-lemon-600">{insights.tipTransactionCount}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </SuperAdminLayout>
  )
}
