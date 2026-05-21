import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-60 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
