import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import * as authApi from '../api/auth'

export default function Register() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [form, setForm] = useState({ name: '', phone: '+251', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, email: form.email || undefined }
      const { data } = await authApi.register(payload)
      signIn(data.accessToken, data.refreshToken, data.business.name)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Set up your business</h1>
        <p className="text-gray-500 mt-1.5 text-sm">Create your Salesify account in seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            placeholder="e.g. Habesha Restaurant"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-lemon-400 focus:border-transparent transition-all bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-gray-400 font-normal">(Telebirr merchant)</span></label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-lemon-400 focus:border-transparent transition-all bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Email <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="email"
            placeholder="owner@business.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-lemon-400 focus:border-transparent transition-all bg-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-lemon-400 focus:border-transparent transition-all bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="animate-fade-up bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 bg-lemon-400 hover:bg-lemon-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-150 text-sm"
        >
          {loading ? 'Creating…' : 'Create Business'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-lemon-600 font-semibold hover:text-lemon-700 transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}
