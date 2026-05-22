import { type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import * as authApi from '../../api/auth'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) return <Navigate to="/" replace />

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {})
    signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-40">
        <span className="font-bold text-gray-900 text-lg">Salesify</span>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 p-1">
          <LogOut size={22} />
        </button>
      </div>
      <main className="md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
