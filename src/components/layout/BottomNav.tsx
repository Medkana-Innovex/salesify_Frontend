import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, BarChart2, GitBranch, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const bmItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/staff', icon: Users, label: 'Staff' },
  { to: '/transactions', icon: CreditCard, label: 'Sales' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const gmItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/staff', icon: Users, label: 'Staff' },
  { to: '/branches', icon: GitBranch, label: 'Branches' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const { user } = useAuth()
  const items = user?.role === 'general_manager' ? gmItems : bmItems

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-1 py-2 z-40">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-150 min-w-[52px] ${
              isActive ? 'bg-lemon-50 text-lemon-600' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-lemon-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
