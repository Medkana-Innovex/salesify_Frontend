import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TrendingUp, LogOut, Building2, BarChart2 } from 'lucide-react'
import TopLoader from '../ui/TopLoader'

const navItems = [
  { to: '/superadmin', icon: BarChart2, label: 'Insights' },
  { to: '/superadmin/businesses', icon: Building2, label: 'Businesses' },
]

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('saToken')
    navigate('/superadmin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TopLoader />

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex-col z-50">
        <div className="flex items-center gap-2.5 px-5 py-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-lemon-400 rounded-xl flex items-center justify-center">
            <TrendingUp size={16} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Salesify</p>
            <p className="text-xs text-lemon-600 font-medium">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = pathname === to
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${
                  isActive ? 'bg-lemon-50 text-lemon-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-lemon-400 rounded-lg flex items-center justify-center">
              <TrendingUp size={14} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 text-sm">Salesify</span>
            <span className="text-xs font-semibold bg-lemon-100 text-lemon-700 px-2 py-0.5 rounded-full">Super Admin</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
        {/* Mobile tabs */}
        <div className="flex border-t border-gray-100">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = pathname === to
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
                  isActive ? 'text-lemon-600 border-b-2 border-lemon-400' : 'text-gray-400 border-b-2 border-transparent'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pt-24 md:pt-0 px-4 py-6 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
