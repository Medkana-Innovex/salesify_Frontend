import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, GitBranch, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { saGetBusiness } from '../../api/superadmin'
import SuperAdminLayout from '../../components/layout/SuperAdminLayout'

interface Branch { id: string; name: string; isActive: boolean }
interface TxRow {
  id: string; amount: string; platformFee: string | null; tipAmount: string | null
  telebirrRef: string | null; transactedAt: string
  branch: { name: string }; staff: { fullName: string }
}
interface BusinessData {
  id: string; name: string; phone: string; email: string | null
  branches: Branch[]
  totalTransactions: number
  totalRevenue: number
  totalFeesCollected: number
  feeTransactionCount: number
  noFeeTransactionCount: number
  totalTipsCollected: number
  transactions: TxRow[]
  txHasMore: boolean
  txPage: number
}

function fmt(n: number) {
  return n.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<BusinessData | null>(null)
  const [transactions, setTransactions] = useState<TxRow[]>([])
  const [txHasMore, setTxHasMore] = useState(false)
  const [txPage, setTxPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    saGetBusiness(id!, 1)
      .then((res) => {
        setBusiness(res.data)
        setTransactions(res.data.transactions)
        setTxHasMore(res.data.txHasMore)
        setTxPage(1)
      })
      .catch((err) => { if (err.response?.status === 401) navigate('/superadmin/login') })
      .finally(() => setLoading(false))
  }, [id])

  const loadMoreTx = async () => {
    setLoadingMore(true)
    try {
      const next = txPage + 1
      const res = await saGetBusiness(id!, next)
      setTransactions((prev) => [...prev, ...res.data.transactions])
      setTxHasMore(res.data.txHasMore)
      setTxPage(next)
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/superadmin/login')
    } finally {
      setLoadingMore(false)
    }
  }

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
        <button onClick={() => navigate('/superadmin/businesses')}
          className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{business.name}</h1>
          <p className="text-xs md:text-sm text-gray-400 truncate">
            {business.phone}{business.email ? ` · ${business.email}` : ''}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3">
        <div className="bg-lemon-50 rounded-2xl p-3 md:p-4">
          <p className="text-xs text-gray-400 mb-1">Total Revenue</p>
          <p className="text-base md:text-lg font-bold text-gray-900">ETB {fmt(business.totalRevenue)}</p>
        </div>
        <div className="bg-lemon-50 rounded-2xl p-3 md:p-4">
          <p className="text-xs text-gray-400 mb-1">Fees Collected</p>
          <p className="text-base md:text-lg font-bold text-lemon-600">ETB {fmt(business.totalFeesCollected)}</p>
        </div>
        <div className="bg-lemon-50 rounded-2xl p-3 md:p-4">
          <p className="text-xs text-gray-400 mb-1">Tips Collected</p>
          <p className="text-base md:text-lg font-bold text-gray-900">ETB {fmt(business.totalTipsCollected)}</p>
        </div>
        <div className="bg-lemon-50 rounded-2xl p-3 md:p-4">
          <p className="text-xs text-gray-400 mb-1">Branches</p>
          <p className="text-base md:text-lg font-bold text-gray-900">{business.branches.length}</p>
        </div>
      </div>

      {/* Fee breakdown */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm mb-4">
        <p className="font-semibold text-gray-800 text-sm mb-3">Transaction Breakdown</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-gray-50 rounded-xl py-3 px-1">
            <p className="text-lg md:text-xl font-bold text-gray-900">{business.totalTransactions}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </div>
          <div className="text-center bg-green-50 rounded-xl py-3 px-1 flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <CheckCircle size={12} className="text-green-500" />
              <p className="text-lg md:text-xl font-bold text-gray-900">{business.feeTransactionCount}</p>
            </div>
            <p className="text-xs text-gray-400">With Fee</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl py-3 px-1 flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1">
              <XCircle size={12} className="text-gray-400" />
              <p className="text-lg md:text-xl font-bold text-gray-900">{business.noFeeTransactionCount}</p>
            </div>
            <p className="text-xs text-gray-400">No Fee</p>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm mb-4">
        <p className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
          <GitBranch size={15} className="text-lemon-600" /> Branches
        </p>
        {business.branches.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No branches</p>
        ) : (
          <div className="flex flex-col gap-2">
            {business.branches.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-800 truncate mr-2">{b.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  b.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                }`}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All transactions */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-lemon-600" /> Transactions
          </p>
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-3 py-3 bg-gray-50 rounded-xl">
                {/* Top row: branch + amount */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.branch.name}</p>
                    <p className="text-xs text-gray-400 truncate">{tx.staff.fullName}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 flex-shrink-0">ETB {fmt(Number(tx.amount))}</p>
                </div>
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {tx.platformFee ? (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      <CheckCircle size={10} /> Fee ETB {fmt(Number(tx.platformFee))}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      <XCircle size={10} /> No fee
                    </span>
                  )}

                  <span className="text-xs text-gray-300 ml-auto">
                    {new Date(tx.transactedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {tx.telebirrRef && (
                  <p className="text-xs font-mono text-gray-300 mt-1 truncate">{tx.telebirrRef}</p>
                )}
              </div>
            ))}

            {txHasMore && (
              <button
                onClick={loadMoreTx}
                disabled={loadingMore}
                className="w-full py-3 text-sm font-medium text-lemon-600 bg-lemon-50 hover:bg-lemon-100 rounded-2xl transition-colors disabled:opacity-60"
              >
                {loadingMore ? 'Loading…' : 'Load More'}
              </button>
            )}
          </div>
        </div>
      )}

    </SuperAdminLayout>
  )
}
