import { useEffect, useState } from 'react'
import { Search, Filter, X, CreditCard } from 'lucide-react'
import * as transactionsApi from '../api/transactions'
import * as branchesApi from '../api/branches'
import type { Transaction, Branch } from '../types'
import { useAuth } from '../context/AuthContext'
import Portal from '../components/ui/Portal'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

interface FilterPanelProps {
  filters: { branchId: string; from: string; to: string }
  branches: Branch[]
  showBranch: boolean
  onChange: (f: { branchId: string; from: string; to: string }) => void
  onApply: () => void
  onClear: () => void
  onClose: () => void
}

function FilterPanel({ filters, branches, showBranch, onChange, onApply, onClear, onClose }: FilterPanelProps) {
  return (
    <>
      {/* Mobile bottom sheet */}
      <Portal>
        <div className="md:hidden fixed inset-0 bg-black/40 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-3xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Filter Transactions</h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
              {showBranch && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Branch</label>
                  <select value={filters.branchId} onChange={(e) => onChange({ ...filters, branchId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400 bg-white">
                    <option value="">All branches</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
                <input type="date" value={filters.from} onChange={(e) => onChange({ ...filters, from: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
                <input type="date" value={filters.to} onChange={(e) => onChange({ ...filters, to: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400" />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={onClear} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-xl">Clear</button>
              <button onClick={() => { onApply(); onClose() }} className="flex-1 bg-lemon-400 text-white text-sm font-semibold py-3 rounded-xl">Apply</button>
            </div>
          </div>
        </div>
      </Portal>

      {/* Desktop inline */}
      <div className="hidden md:flex bg-white rounded-2xl p-4 mb-5 shadow-sm gap-3 items-end">
        {showBranch && (
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs text-gray-500">Branch</label>
            <select value={filters.branchId} onChange={(e) => onChange({ ...filters, branchId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400">
              <option value="">All branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-gray-500">From</label>
          <input type="date" value={filters.from} onChange={(e) => onChange({ ...filters, from: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400" />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs text-gray-500">To</label>
          <input type="date" value={filters.to} onChange={(e) => onChange({ ...filters, to: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400" />
        </div>
        <button onClick={onApply} className="bg-lemon-400 hover:bg-lemon-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">Apply</button>
        <button onClick={onClear} className="text-gray-500 text-sm font-medium px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">Clear</button>
      </div>
    </>
  )
}

export default function Transactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ branchId: '', from: '', to: '' })
  const [loading, setLoading] = useState(true)

  const isFiltered = !!(filters.branchId || filters.from || filters.to)

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filters.branchId) params.branchId = filters.branchId
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      const { data } = await transactionsApi.listTransactions(params)
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    if (user?.role === 'general_manager') {
      branchesApi.listBranches().then((res) => setBranches(res.data))
    }
  }, [])

  const handleClear = () => {
    setFilters({ branchId: '', from: '', to: '' })
    setTimeout(fetchTransactions, 0)
  }

  const filtered = transactions.filter((tx) => {
    const q = search.toLowerCase()
    return (
      (tx.staff?.fullName ?? '').toLowerCase().includes(q) ||
      (tx.staff?.code ?? '').toLowerCase().includes(q) ||
      (tx.telebirrRef ?? '').toLowerCase().includes(q)
    )
  })

  const totalAmount = filtered.reduce((sum, tx) => sum + Number(tx.amount), 0)

  return (
    <div className="px-4 pt-6 pb-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border transition-all ${
            showFilters || isFiltered ? 'bg-lemon-400 text-white border-lemon-400' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <Filter size={15} />
          Filter
          {isFiltered && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          branches={branches}
          showBranch={user?.role === 'general_manager'}
          onChange={setFilters}
          onApply={fetchTransactions}
          onClear={handleClear}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by staff name, code or ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lemon-400 bg-white"
        />
      </div>

      {/* Summary strip */}
      {!loading && filtered.length > 0 && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-lemon-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Total Sales</p>
            <p className="font-bold text-gray-900 text-sm">ETB {totalAmount.toLocaleString('en-ET', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="flex-1 bg-lemon-50 rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Count</p>
            <p className="font-bold text-gray-900 text-sm">{filtered.length} tx</p>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <CreditCard size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">No transactions found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((tx) => (
            <div key={tx.id} className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow duration-200">
              <div className="w-10 h-10 rounded-full bg-lemon-100 text-lemon-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {tx.staff ? initials(tx.staff.fullName) : '?'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm truncate">{tx.staff?.fullName ?? 'Unknown'}</p>
                  {tx.staff?.code && (
                    <span className="text-xs text-lemon-600 font-medium bg-lemon-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      #{tx.staff.code}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-gray-400 text-xs">{formatDate(tx.transactedAt)}</p>
                  {tx.branch?.name && (
                    <span className="text-gray-300 text-xs">· {tx.branch.name}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">ETB {Number(tx.amount).toFixed(2)}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-600">Paid</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
