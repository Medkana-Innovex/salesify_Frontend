import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as authApi from '../api/auth'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [form, setForm] = useState({ phone: '+251', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login({ phone: form.phone, password: form.password })
      signIn(data.accessToken, data.refreshToken, data.businessName)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your business</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lemon-400"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-lemon-400 text-gray-900 font-semibold py-4 rounded-2xl mt-2 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-gray-500 mt-5 text-sm"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
