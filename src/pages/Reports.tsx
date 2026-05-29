import { useEffect, useState } from 'react'
import { Download, BarChart2 } from 'lucide-react'
import * as reportsApi from '../api/reports'

type Period = 'daily' | 'weekly' | 'monthly' | 'all'

interface BranchSummary {
  branchId: string
  branchName: string
  totalSales: number
  transactionCount: number
}

interface StaffRow {
  staffId: string
  fullName: string
  branchName: string
  totalSales: number
  transactionCount: number
}

function getPeriodDates(period: Period): { from?: string; to?: string } {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  if (period === 'daily') return { from: fmt(now), to: fmt(now) }
  if (period === 'weekly') {
    const from = new Date(now); from.setDate(now.getDate() - 6)
    return { from: fmt(from), to: fmt(now) }
  }
  if (period === 'monthly') {
    return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(now) }
  }
  return {}
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const tabs: { label: string; value: Period }[] = [
  { label: 'Today', value: 'daily' },
  { label: 'This Week', value: 'weekly' },
  { label: 'This Month', value: 'monthly' },
  { label: 'All Time', value: 'all' },
]

export default function Reports() {
  const [period, setPeriod] = useState<Period>('weekly')
  const [summary, setSummary] = useState<BranchSummary[]>([])
  const [staffRows, setStaffRows] = useState<StaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const fetchReports = async (p: Period) => {
    setLoading(true)
    const params = getPeriodDates(p)
    try {
      const [summaryRes, staffRes] = await Promise.all([
        reportsApi.getSummaryReport(params),
        reportsApi.getStaffReport(params),
      ])
      setSummary(summaryRes.data)
      setStaffRows(staffRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReports(period) }, [])

  const handlePeriod = (p: Period) => {
    setPeriod(p)
    fetchReports(p)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = getPeriodDates(period)
      const { data } = await reportsApi.exportPdf(params)
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'salesify-report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const totalRevenue = summary.reduce((s, b) => s + Number(b.totalSales), 0)
  const totalTx = summary.reduce((s, b) => s + b.transactionCount, 0)
  const avgTx = totalTx > 0 ? totalRevenue / totalTx : 0
  const maxStaffSales = Math.max(...staffRows.map((r) => r.totalSales), 1)
  const hasData = totalTx > 0

  return (
    <div className="px-4 pt-6 pb-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handleExport}
          disabled={exporting || !hasData}
          className="flex items-center gap-2 bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition-all duration-150"
        >
          <Download size={15} />
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => handlePeriod(t.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
              period === t.value
                ? 'bg-lemon-400 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-lemon-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : !hasData ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <BarChart2 size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">No data for this period</p>
          <p className="text-sm text-gray-400">Try selecting a different time range</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-lemon-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Revenue</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                ETB {totalRevenue.toLocaleString('en-ET', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-lemon-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Transactions</p>
              <p className="text-lg font-bold text-gray-900">{totalTx}</p>
            </div>
            <div className="bg-lemon-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Avg / Tx</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">
                ETB {avgTx.toLocaleString('en-ET', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Branch + Staff side by side on desktop */}
          <div className="md:grid md:grid-cols-2 md:gap-4">

            {/* Branch summary */}
            {summary.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 md:mb-0">
                <p className="font-semibold text-gray-800 text-sm mb-4">Branch Breakdown</p>
                <div className="flex flex-col gap-4">
                  {summary.map((b) => {
                    const pct = totalRevenue > 0 ? Math.round((Number(b.totalSales) / totalRevenue) * 100) : 0
                    return (
                      <div key={b.branchId}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{b.branchName}</p>
                            <p className="text-gray-400 text-xs">{b.transactionCount} transactions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-sm">
                              ETB {Number(b.totalSales).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-lemon-600 font-semibold">{pct}%</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-lemon-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Staff performance */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 md:mb-0">
              <p className="font-semibold text-gray-800 text-sm mb-4">Staff Performance</p>
              {staffRows.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No staff data</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {staffRows.map((row, i) => {
                    const pct = Math.round((row.totalSales / maxStaffSales) * 100)
                    return (
                      <div key={row.staffId}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              i === 0 ? 'bg-lemon-400 text-white' : 'bg-lemon-100 text-lemon-600'
                            }`}>
                              {initials(row.fullName)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 leading-tight">{row.fullName}</p>
                              <p className="text-xs text-gray-400">{row.transactionCount} tx</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            ETB {row.totalSales.toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-lemon-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}
