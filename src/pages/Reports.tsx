import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
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

  if (period === 'daily') {
    return { from: fmt(now), to: fmt(now) }
  }
  if (period === 'weekly') {
    const from = new Date(now)
    from.setDate(now.getDate() - 6)
    return { from: fmt(from), to: fmt(now) }
  }
  if (period === 'monthly') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: fmt(from), to: fmt(now) }
  }
  return {}
}

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

  const tabs: { label: string; value: Period }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div className="px-4 pt-6 pb-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-lemon-400 text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-60"
        >
          <Download size={15} />
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => handlePeriod(t.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === t.value
                ? 'bg-lemon-400 text-gray-900'
                : 'bg-white text-gray-600 border border-gray-200'
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
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-lemon-400">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">ETB {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-lemon-400">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Transactions</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{totalTx}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-lemon-400 col-span-2 md:col-span-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Transaction</p>
              <p className="text-xl font-bold text-gray-900 mt-1">ETB {avgTx.toFixed(2)}</p>
            </div>
          </div>

          {/* Desktop: side by side */}
          <div className="md:grid md:grid-cols-2 md:gap-5">

            {/* Branch summary */}
            {summary.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-5 md:mb-0">
                <p className="font-semibold text-gray-800 mb-4">Branch Summary</p>
                <div className="flex flex-col gap-4">
                  {summary.map((b) => {
                    const pct = totalRevenue > 0 ? Math.round((Number(b.totalSales) / totalRevenue) * 100) : 0
                    return (
                      <div key={b.branchId}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{b.branchName}</p>
                            <p className="text-gray-400 text-xs">{b.transactionCount} transactions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-sm">ETB {Number(b.totalSales).toFixed(2)}</p>
                            <p className="text-xs text-lemon-600 font-medium">{pct}%</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-lemon-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Staff performance */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-5 md:mb-0">
              <p className="font-semibold text-gray-800 mb-4">Staff Performance</p>
              {staffRows.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No data for this period</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {staffRows.map((row, i) => {
                    const pct = Math.round((row.totalSales / maxStaffSales) * 100)
                    const colors = ['bg-lemon-400', 'bg-lemon-500', 'bg-lemon-300', 'bg-lemon-600']
                    const color = colors[i % colors.length]
                    return (
                      <div key={row.staffId}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-lemon-100 text-lemon-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {row.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <p className="text-sm font-medium text-gray-800">{row.fullName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">ETB {row.totalSales.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">{pct}%</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{row.transactionCount} transactions</p>
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
