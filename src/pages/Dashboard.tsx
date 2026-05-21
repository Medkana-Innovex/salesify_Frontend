import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import * as dashboardApi from '../api/dashboard'
import * as staffApi from '../api/staff'
import type { TrendPoint, LeaderboardEntry, Staff } from '../types'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
      {initials}
    </div>
  )
}

export default function Dashboard() {
  const { businessName } = useAuth()
  const navigate = useNavigate()

  const [summary, setSummary] = useState<{ totalSales: number; transactionCount: number } | null>(null)
  const [trend, setTrend] = useState<TrendPoint[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeStaff, setActiveStaff] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    const from = new Date(today)
    from.setDate(today.getDate() - 6)

    Promise.all([
      dashboardApi.getSummary({ from: from.toISOString().slice(0, 10) }),
      dashboardApi.getTrend({ from: from.toISOString().slice(0, 10), groupBy: 'day' }),
      dashboardApi.getLeaderboard({}),
      staffApi.listStaff(),
    ]).then(([summaryRes, trendRes, leaderboardRes, staffRes]) => {
      setSummary(summaryRes.data)
      setTrend(trendRes.data)
      setLeaderboard(leaderboardRes.data)
      setActiveStaff(staffRes.data.filter((s: Staff) => s.isActive).length)
    }).finally(() => setLoading(false))
  }, [])

  const maxSales = Math.max(...leaderboard.map((e) => e.totalSales), 1)

  return (
    <div className="px-4 pt-6 pb-4 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          {getGreeting()}{businessName ? `, ${businessName}` : ''} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening today</p>
      </div>

      {/* Summary Card */}
      <div
        className="rounded-2xl p-5 mb-5 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #3b5fc0 0%, #5b7cf5 100%)' }}
      >
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/10 translate-x-8 -translate-y-8" />
        <div className="absolute right-8 bottom-0 w-20 h-20 rounded-full bg-white/10 translate-y-6" />

        <p className="text-white/80 text-sm mb-1">Total Sales Today</p>
        {loading ? (
          <div className="h-10 w-40 bg-white/20 rounded-lg animate-pulse mb-4" />
        ) : (
          <p className="text-white text-4xl font-bold mb-4">
            ETB {Number(summary?.totalSales ?? 0).toFixed(2)}
          </p>
        )}

        <div className="flex gap-6">
          <div>
            <p className="text-white/70 text-xs">Transactions</p>
            <p className="text-white font-bold text-lg">{summary?.transactionCount ?? '—'}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs">Staff Active</p>
            <p className="text-white font-bold text-lg">{activeStaff}</p>
          </div>
        </div>
      </div>

      {/* Trend + Leaderboard: side by side on desktop */}
      <div className="md:grid md:grid-cols-2 md:gap-5">

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl p-4 mb-5 md:mb-0 shadow-sm">
        <p className="font-semibold text-gray-800 mb-4">7-Day Sales Trend</p>
        {loading ? (
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ) : trend.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4b6ee8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4b6ee8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="period"
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { weekday: 'short' })}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v) => [`ETB ${Number(v).toFixed(2)}`, 'Sales']}
                labelFormatter={(l) => new Date(l).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#4b6ee8"
                strokeWidth={2.5}
                fill="url(#salesGrad)"
                dot={{ fill: '#4b6ee8', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl p-4 mb-5 md:mb-0 shadow-sm">
        <p className="font-semibold text-gray-800 mb-4">Top Staff (All Time)</p>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
        ) : (
          <div className="flex flex-col gap-4">
            {leaderboard.map((entry, i) => (
              <div key={entry.staffId} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm font-medium w-5">#{i + 1}</span>
                <Avatar name={entry.fullName} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">{entry.fullName}</p>
                    <div className="text-right ml-2">
                      <p className="text-gray-800 font-bold text-sm">ETB {entry.totalSales.toFixed(2)}</p>
                      <p className="text-blue-500 text-xs">{entry.transactionCount} tx</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(entry.totalSales / maxSales) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      </div>{/* end trend+leaderboard grid */}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-4 mt-5 shadow-sm">
        <p className="font-semibold text-gray-800 mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/staff')}
            className="flex flex-col items-center gap-2 bg-amber-50 rounded-xl py-5 text-gray-700 font-semibold text-sm"
          >
            <span className="text-2xl">👤</span>
            Add Staff
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center gap-2 bg-purple-50 rounded-xl py-5 text-gray-700 font-semibold text-sm"
          >
            <span className="text-2xl">📊</span>
            View Reports
          </button>
        </div>
      </div>
    </div>
  )
}
