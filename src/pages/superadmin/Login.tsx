import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'
import { saLogin } from '../../api/superadmin'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ phone: '+251', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await saLogin(form.phone, form.password)
      localStorage.setItem('saToken', data.token)
      navigate('/superadmin')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left — branded panel */}
      <div className="hidden md:flex flex-col justify-between w-80 flex-shrink-0 p-10"
        style={{ background: 'linear-gradient(160deg, #557d24 0%, #6fa42e 50%, #8dc63f 100%)' }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white text-xl">Salesify</span>
        </div>
        <div>
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Super Admin
          </span>
          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            Platform<br />Control Center
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Manage all businesses, branches, and platform insights.
          </p>
        </div>
        <p className="text-white/30 text-xs">© 2026 Medkainovex</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Mobile header */}
        <div className="md:hidden flex flex-col items-center justify-center pt-14 pb-10 px-6"
          style={{ background: 'linear-gradient(160deg, #557d24 0%, #6fa42e 60%, #8dc63f 100%)' }}>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={28} color="white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-white">Salesify</h1>
          <p className="text-white/70 text-sm mt-1">Super Admin</p>
        </div>

        <div className="md:hidden flex-1 bg-white rounded-t-3xl -mt-4 px-6 pt-8 pb-10">
          <FormContent form={form} setForm={setForm} showPassword={showPassword}
            setShowPassword={setShowPassword} error={error} loading={loading} onSubmit={handleSubmit} />
        </div>

        <div className="hidden md:flex flex-1 flex-col justify-center px-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="text-gray-400 text-sm mt-1">Super admin access only</p>
          </div>
          <FormContent form={form} setForm={setForm} showPassword={showPassword}
            setShowPassword={setShowPassword} error={error} loading={loading} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}

function FormContent({ form, setForm, showPassword, setShowPassword, error, loading, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => { if (e.target.value.length <= 13) setForm({ ...form, phone: e.target.value }) }}
          maxLength={13}
          required
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400 bg-white"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400 bg-white"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="bg-lemon-400 hover:bg-lemon-500 active:scale-95 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all duration-150 text-sm"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
