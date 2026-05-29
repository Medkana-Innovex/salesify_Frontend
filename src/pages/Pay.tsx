import { useState } from 'react'
import axios from 'axios'
import { TrendingUp, X } from 'lucide-react'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')
const WEBHOOK_SECRET = import.meta.env.VITE_TELEBIRR_WEBHOOK_SECRET ?? 'medkainovex@telebirr2026'

function generateRef() {
  return 'TXN' + Date.now() + Math.floor(Math.random() * 1000)
}

function fmt(n: number) {
  return n.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

const ERROR_MESSAGES: Record<string, { title: string; hint: string }> = {
  'Business not found':                   { title: 'Phone not recognised',    hint: 'Check the business phone number and try again.' },
  'Branch not found':                     { title: 'Branch not found',         hint: 'The phone number is not linked to any branch.' },
  'Staff not found':                      { title: 'Invalid staff code',       hint: 'Make sure the staff code is correct for this branch.' },
  'Staff does not belong to this branch': { title: 'Wrong staff code',         hint: 'This staff member is not part of the selected branch.' },
  'No branch assigned':                   { title: 'Branch not configured',    hint: 'Contact your manager — no branch is set up for this account.' },
}

function friendlyError(raw: string) {
  return ERROR_MESSAGES[raw] ?? { title: 'Payment failed', hint: raw }
}

type SuccessData = { transactionId: string; amount: number; tipAmount: number }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

export default function Pay() {
  const [form, setForm] = useState({ businessPhone: '+251', staffCode: '', amount: '', tipAmount: '' })
  const [showTip, setShowTip] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [success, setSuccess] = useState<SuccessData | null>(null)

  const amount = parseFloat(form.amount) || 0
  const tip = parseFloat(form.tipAmount) || 0
  const total = amount + tip
  const hasAmount = amount > 0

  function triggerShake() {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        businessPhone: form.businessPhone,
        staffCode: form.staffCode,
        amount,
        ...(tip > 0 ? { tipAmount: tip } : {}),
        telebirrRef: generateRef(),
        transactedAt: new Date().toISOString(),
      }
      const { data } = await axios.post(`${BASE_URL}/webhook/telebirr`, payload, {
        headers: { 'x-telebirr-secret': WEBHOOK_SECRET },
      })
      setSuccess({ transactionId: data.transactionId, amount, tipAmount: tip })
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Payment failed. Please try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setSuccess(null)
    setShowTip(false)
    setForm({ businessPhone: '+251', staffCode: '', amount: '', tipAmount: '' })
    setError('')
  }

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen bg-lemon-50 flex items-center justify-center p-4">
        <div className="animate-fade-up bg-white rounded-3xl p-8 shadow-sm w-full max-w-sm text-center">
          <div className="animate-pop-in flex items-center justify-center w-20 h-20 bg-lemon-400 rounded-full mx-auto mb-5 animate-ring">
            <svg className="w-10 h-10" viewBox="0 0 52 52" fill="none">
              <path d="M14 27l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="40" strokeDashoffset="40"
                style={{ animation: 'draw-check 0.4s ease 0.3s forwards' }} />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
          <p className="text-gray-400 text-sm mb-6">Your transaction has been recorded</p>

          <div className="bg-lemon-50 rounded-2xl px-5 py-4 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Amount</span>
              <span className="font-bold text-gray-900">ETB {fmt(success.amount)}</span>
            </div>
            {success.tipAmount > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Tip</span>
                  <span className="font-semibold text-gray-700">ETB {fmt(success.tipAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-lemon-200">
                  <span className="text-gray-600 text-sm font-medium">Total</span>
                  <span className="font-bold text-lemon-600">ETB {fmt(success.amount + success.tipAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-500 text-sm">Ref</span>
              <span className="font-mono text-xs text-gray-400 truncate max-w-[160px]">{success.transactionId}</span>
            </div>
          </div>

          <button onClick={reset} className="w-full bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white font-semibold py-4 rounded-2xl transition-all duration-150">
            Make Another Payment
          </button>
        </div>
      </div>
    )
  }

  /* ── Pay form ── */
  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left — branded panel (desktop) */}
      <div className="hidden md:flex flex-col justify-between w-80 flex-shrink-0 p-10"
        style={{ background: 'linear-gradient(160deg, #557d24 0%, #6fa42e 50%, #8dc63f 100%)' }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-white text-xl">Salesify</span>
        </div>

        <div>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Total Amount</p>
          <p className={`font-bold text-white transition-all duration-300 ${hasAmount ? 'text-5xl' : 'text-3xl opacity-40'}`}>
            ETB {fmt(total)}
          </p>
          {tip > 0 && (
            <p className="text-white/60 text-sm mt-2">ETB {fmt(amount)} + ETB {fmt(tip)} tip</p>
          )}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
              <div className="w-2 h-2 bg-lemon-300 rounded-full" />
              <span className="text-white/80 text-sm">Secure & instant payment</span>
            </div>
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2026 Medkainovex</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Mobile header */}
        <div className="md:hidden px-6 pt-10 pb-6 text-center"
          style={{ background: 'linear-gradient(160deg, #557d24 0%, #6fa42e 60%, #8dc63f 100%)' }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-lg">Salesify</span>
          </div>
          <p className="text-white/70 text-sm">Pay with Salesify</p>

          {/* Mobile amount */}
          <div className="mt-4">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Total</p>
            <p className={`font-bold text-white transition-all duration-300 ${hasAmount ? 'text-4xl' : 'text-2xl opacity-40'}`}>
              ETB {fmt(total)}
            </p>
          </div>
        </div>

        {/* Desktop title */}
        <div className="hidden md:block px-10 pt-10 pb-2">
          <h1 className="text-2xl font-bold text-gray-900">Pay with Salesify</h1>
          <p className="text-gray-400 text-sm mt-1">Enter the merchant and amount details below</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`flex-1 flex flex-col px-6 md:px-10 py-6 gap-4 ${shaking ? 'animate-shake' : ''}`}
        >
          <Field label="Business Phone">
            <input
              type="tel"
              value={form.businessPhone}
              onChange={(e) => { if (e.target.value.length <= 13) setForm({ ...form, businessPhone: e.target.value }) }}
              maxLength={13}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-lemon-400 focus:ring-2 focus:ring-lemon-100 transition-all"
            />
          </Field>

          <Field label="Staff Code">
            <input
              type="text"
              placeholder="e.g. 102"
              value={form.staffCode}
              onChange={(e) => setForm({ ...form, staffCode: e.target.value })}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-lemon-400 focus:ring-2 focus:ring-lemon-100 transition-all"
            />
          </Field>

          <Field label="Amount (ETB)">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-lemon-400 focus:ring-2 focus:ring-lemon-100 transition-all"
              />
            </div>
          </Field>

          {/* Tip */}
          {!showTip ? (
            <button type="button" onClick={() => setShowTip(true)}
              className="text-lemon-500 text-sm font-medium text-left hover:text-lemon-600 transition-colors flex items-center gap-1.5 w-fit">
              <span className="flex items-center justify-center w-5 h-5 bg-lemon-100 rounded-full text-xs">+</span>
              Add a tip
            </button>
          ) : (
            <div className="flex flex-col gap-1.5 animate-fade-up">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tip (ETB)</label>
                <button type="button" onClick={() => { setShowTip(false); setForm({ ...form, tipAmount: '' }) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Remove
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
                <input
                  type="number" placeholder="0.00" min="0.01" step="0.01"
                  value={form.tipAmount}
                  onChange={(e) => setForm({ ...form, tipAmount: e.target.value })}
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-lemon-400 focus:ring-2 focus:ring-lemon-100 transition-all"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (() => {
            const { title, hint } = friendlyError(error)
            return (
              <div className="animate-fade-up bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex gap-3 items-start">
                <div className="shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 bg-red-100 rounded-full">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-700">{title}</p>
                  <p className="text-xs text-red-400 mt-0.5">{hint}</p>
                </div>
                <button type="button" onClick={() => setError('')} className="shrink-0 text-red-300 hover:text-red-500 mt-0.5">
                  <X size={16} />
                </button>
              </div>
            )
          })()}

          {/* Pay button — always visible, pinned to bottom on mobile */}
          <div className="mt-auto pt-2">
            <button
              type="submit"
              disabled={loading || !hasAmount}
              className="w-full bg-lemon-400 hover:bg-lemon-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Spinner /><span>Processing…</span></>
              ) : (
                <span>Pay {hasAmount ? `ETB ${fmt(total)}` : 'Now'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
