import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, BarChart2, Settings, GitBranch } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const baseItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/staff', icon: Users, label: 'Staff' },
  { to: '/transactions', icon: CreditCard, label: 'Transactions' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
]

export default function BottomNav() {
  const { user } = useAuth()
  const items = user?.role === 'general_manager'
    ? [...baseItems, { to: '/branches', icon: GitBranch, label: 'Branches' }, { to: '/settings', icon: Settings, label: 'Settings' }]
    : [...baseItems, { to: '/settings', icon: Settings, label: 'Settings' }]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-40">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs px-3 py-1 ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
