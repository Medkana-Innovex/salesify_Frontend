import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, GitBranch, TrendingUp } from 'lucide-react'
import { saGetBusiness } from '../../api/superadmin'
import SuperAdminLayout from '../../components/layout/SuperAdminLayout'

interface Branch { id: string; name: string; isActive: boolean }
interface TxRow {
  id: string; amount: string; platformFee: string
  telebirrRef: string | null; transactedAt: string
  branch: { name: string }; staff: { fullName: string }
}
interface BusinessData {
  id: string; name: string; phone: string; email: string | null
  branches: Branch[]
  totalFeesCollected: number
  feeTransactionCount: number
  transactions: TxRow[]
}

function fmt(n: number) {
  return n.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    saGetBusiness(id!)
      .then((res) => setBusiness(res.data))
      .catch((err) => {
        if (err.response?.status === 401) navigate('/superadmin/login')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
      </div>
    </SuperAdminLayout>
  )

  if (!business) return null

  return (
    <SuperAdminLayout>

      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/superadmin')}
          className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-sm text-gray-400">{business.phone}{business.email ? ` · ${business.email}` : ''}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-lemon-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Branches</p>
          <p className="text-xl font-bold text-gray-900">{business.branches.length}</p>
        </div>
        <div className="bg-lemon-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Fees Collected</p>
          <p className="text-xl font-bold text-lemon-600">ETB {fmt(business.totalFeesCollected)}</p>
        </div>
        <div className="bg-lemon-50 rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-1">Fee Transactions</p>
          <p className="text-xl font-bold text-gray-900">{business.feeTransactionCount}</p>
        </div>
      </div>

      {/* Branches */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <p className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
          <GitBranch size={15} className="text-lemon-600" /> Branches
        </p>
        {business.branches.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No branches</p>
        ) : (
          <div className="flex flex-col gap-2">
            {business.branches.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-800">{b.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  b.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                }`}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fee transactions */}
      {business.transactions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-lemon-600" /> Fee Transactions
          </p>
          <div className="flex flex-col gap-2">
            {business.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">{tx.branch.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.transactedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {tx.telebirrRef && (
                    <p className="text-xs font-mono text-gray-300 mt-0.5">{tx.telebirrRef}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="text-sm font-bold text-lemon-600">
                    ETB {fmt(Number(tx.platformFee))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </SuperAdminLayout>
  )
}
