import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, BarChart2, Settings, TrendingUp, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import * as authApi from '../../api/auth'

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/staff', icon: Users, label: 'Staff' },
  { to: '/transactions', icon: CreditCard, label: 'Transactions' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { businessName, user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {})
    signOut()
    navigate('/')
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-100">
        <div className="bg-blue-600 rounded-xl p-2">
          <TrendingUp size={20} color="white" />
        </div>
        <span className="font-bold text-gray-900 text-lg">Salesify</span>
      </div>

      {/* Business info */}
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-800 text-sm truncate">{businessName}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {user?.role === 'general_manager' ? 'General Manager' : 'Branch Manager'}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
