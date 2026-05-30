import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SuperAdminLogin from './pages/superadmin/Login'
import SuperAdminInsights from './pages/superadmin/Insights'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import BusinessDetail from './pages/superadmin/BusinessDetail'
import SuperAdminSettings from './pages/superadmin/Settings'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Staff from './pages/Staff'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Branches from './pages/Branches'
import Settings from './pages/Settings'
import Pay from './pages/Pay'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/staff" element={<AppLayout><Staff /></AppLayout>} />
          <Route path="/transactions" element={<AppLayout><Transactions /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
          <Route path="/branches" element={<AppLayout><Branches /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />

          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin" element={<SuperAdminInsights />} />
          <Route path="/superadmin/businesses" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/businesses/:id" element={<BusinessDetail />} />
          <Route path="/superadmin/settings" element={<SuperAdminSettings />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
