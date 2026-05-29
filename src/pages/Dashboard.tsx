import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, BarChart2, CreditCard, GitBranch } from 'lucide-react'
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
    <div className="w-9 h-9 rounded-full bg-lemon-100 text-lemon-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
      {initials}
    </div>
  )
}

const medals = ['🥇', '🥈', '🥉']

const CHART_H = 100



function SalesBarChart({ data }: { data: TrendPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => Number(d.total)), 1)

  return (
    <div className="flex items-end gap-2 w-full" style={{ height: `${CHART_H + 28}px` }}>
      {data.map((d, i) => {
        const barH = Math.max((Number(d.total) / max) * CHART_H, 6)
        const isToday = i === data.length - 1
        const day = new Date(d.period).toLocaleDateString('en', { weekday: 'short' })
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end cursor-pointer"
            style={{ height: `${CHART_H + 28}px` }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {hovered === i && (
              <div className="bg-gray-900 text-white text-xs rounded-xl px-2.5 py-1.5 whitespace-nowrap mb-2 shadow-lg">
                ETB {Number(d.total).toFixed(2)}
              </div>
            )}

            {/* Bar */}
            <div
              className="rounded-t-xl transition-all duration-500"
              style={{ width: '10px',
                height: `${barH}px`,
                background: isToday ? '#557d24' : '#8dc63f',
                opacity: hovered !== null && hovered !== i ? 0.4 : 1,
                transition: 'opacity 0.15s ease, height 0.5s ease-out',
              }}
            />

            {/* Day label */}
            <span className={`text-[10px] font-semibold mt-1.5 ${isToday ? 'text-lemon-700' : 'text-gray-400'}`}>
              {day}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function TxCountChart({ data }: { data: TrendPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...data.map((d) => d.count), 1)
  const points = data.map((d, i) => ({
    x: i,
    y: CHART_H - Math.max((d.count / max) * CHART_H, 6),
    count: d.count,
    day: new Date(d.period).toLocaleDateString('en', { weekday: 'short' }),
    isToday: i === data.length - 1,
  }))
  const w = 100 / (points.length - 1 || 1)

  return (
    <div className="relative w-full" style={{ height: `${CHART_H + 28}px` }}>
      {/* SVG line */}
      <svg className="absolute inset-0 w-full" style={{ height: CHART_H }} viewBox={`0 0 100 ${CHART_H}`} preserveAspectRatio="none">
        <polyline
          points={points.map((p) => `${p.x * w},${p.y}`).join(' ')}
          fill="none"
          stroke="#8dc63f"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Dots + labels */}
      <div className="absolute inset-0 flex items-end">
        {points.map((p, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end cursor-pointer"
            style={{ height: `${CHART_H + 28}px` }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === i && (
              <div className="bg-gray-900 text-white text-xs rounded-xl px-2.5 py-1.5 whitespace-nowrap mb-1 shadow-lg">
                {p.count} tx
              </div>
            )}
            <div style={{ marginBottom: `${CHART_H - p.y - 6}px` }}>
              <div
                className="w-2 h-2 rounded-full transition-all duration-150"
                style={{
                  background: p.isToday ? '#557d24' : '#8dc63f',
                  transform: hovered === i ? 'scale(1.6)' : 'scale(1)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </div>
            <span className={`text-[10px] font-semibold mt-1.5 ${p.isToday ? 'text-lemon-700' : 'text-gray-400'}`}>
              {p.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { businessName, user } = useAuth()
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

  const quickActions = [
    { label: 'Staff', icon: Users, to: '/staff' },
    { label: 'Reports', icon: BarChart2, to: '/reports' },
    { label: 'Transactions', icon: CreditCard, to: '/transactions' },
    ...(user?.role === 'general_manager' ? [{ label: 'Branches', icon: GitBranch, to: '/branches' }] : []),
  ]

  return (
    <div className="px-4 pt-6 pb-6 max-w-5xl mx-auto">

      {/* Greeting */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          {getGreeting()}{businessName ? `, ${businessName}` : ''} 👋
        </h2>
        <p className="text-gray-400 text-sm mt-0.5">Here's what's happening today</p>
      </div>

      {/* Hero card */}
      <div
        className="rounded-2xl p-5 mb-4 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #557d24 0%, #8dc63f 100%)' }}
      >
        <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/10 translate-x-12 -translate-y-12" />
        <div className="absolute right-10 bottom-0 w-24 h-24 rounded-full bg-white/10 translate-y-8" />

        <p className="text-white/70 text-xs uppercase tracking-wider mb-1">Total Sales (7 days)</p>
        {loading ? (
          <div className="h-10 w-44 bg-white/20 rounded-xl animate-pulse mb-4" />
        ) : (
          <p className="text-white text-4xl font-bold mb-4 relative">
            ETB {Number(summary?.totalSales ?? 0).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
          </p>
        )}

        <div className="flex gap-6 relative">
          <div>
            <p className="text-white/60 text-xs">Transactions</p>
            {loading
              ? <div className="h-6 w-10 bg-white/20 rounded animate-pulse mt-1" />
              : <p className="text-white font-bold text-xl">{summary?.transactionCount ?? 0}</p>}
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <p className="text-white/60 text-xs">Active Staff</p>
            {loading
              ? <div className="h-6 w-10 bg-white/20 rounded animate-pulse mt-1" />
              : <p className="text-white font-bold text-xl">{activeStaff}</p>}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Sales bar chart */}
        <div className="bg-lemon-50 rounded-2xl p-5 relative">
          <p className="font-semibold text-gray-800 text-sm mb-4">Sales</p>
          {loading ? (
            <div className="h-36 bg-lemon-100 rounded-xl animate-pulse" />
          ) : trend.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <SalesBarChart data={trend} />
          )}
        </div>

        {/* Transactions dot chart */}
        <div className="bg-lemon-50 rounded-2xl p-5 relative">
          <p className="font-semibold text-gray-800 text-sm mb-4">Transactions</p>
          {loading ? (
            <div className="h-36 bg-lemon-100 rounded-xl animate-pulse" />
          ) : trend.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No data</div>
          ) : (
            <TxCountChart data={trend} />
          )}
        </div>

      </div>

      {/* Leaderboard */}
      <div className="mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-semibold text-gray-800 text-sm mb-4">Top Staff</p>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <div className="flex flex-col gap-3">
              {leaderboard.map((entry, i) => (
                <div key={entry.staffId} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center flex-shrink-0">
                    {medals[i] ?? <span className="text-gray-400 text-sm font-medium">#{i + 1}</span>}
                  </span>
                  <Avatar name={entry.fullName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">{entry.fullName}</p>
                      <p className="text-gray-800 font-bold text-sm ml-2 flex-shrink-0">
                        ETB {Number(entry.totalSales).toLocaleString('en-ET', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lemon-400 rounded-full transition-all duration-500"
                        style={{ width: `${(entry.totalSales / maxSales) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2.5 bg-lemon-50 hover:bg-lemon-100 active:scale-95 rounded-2xl py-5 text-lemon-700 font-semibold text-sm transition-all duration-150"
            >
              <div className="w-10 h-10 bg-lemon-100 rounded-xl flex items-center justify-center">
                <Icon size={20} className="text-lemon-600" />
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
