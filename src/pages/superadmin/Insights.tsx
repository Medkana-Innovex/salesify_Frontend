import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, GitBranch } from 'lucide-react'
import { saGetInsights } from '../../api/superadmin'
import SuperAdminLayout from '../../components/layout/SuperAdminLayout'

interface Insights {
  totalBusinesses: number
  totalBranches: number
  totalTransactions: number
  totalRevenue: number
  totalFeesCollected: number
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
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : insights && (
        <>
          {/* Hero */}
          <div className="rounded-2xl p-5 mb-4 overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #557d24 0%, #8dc63f 100%)' }}>
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/10 translate-x-12 -translate-y-12" />
            <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Salesify Revenue</p>
            <p className="text-white text-4xl font-bold mb-4">ETB {fmt(insights.totalFeesCollected)}</p>
            <div className="flex gap-6">
              <div>
                <p className="text-white/60 text-xs">Transaction Volume</p>
                <p className="text-white font-bold text-lg">ETB {fmt(insights.totalRevenue)}</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-white/60 text-xs">Transactions</p>
                <p className="text-white font-bold text-lg">{insights.totalTransactions}</p>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-lemon-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-lemon-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Businesses</p>
                <p className="text-xl font-bold text-gray-900">{insights.totalBusinesses}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-lemon-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <GitBranch size={18} className="text-lemon-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Branches</p>
                <p className="text-xl font-bold text-gray-900">{insights.totalBranches}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </SuperAdminLayout>
  )
}
