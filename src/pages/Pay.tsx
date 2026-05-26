import { useState, useRef } from 'react'
import axios from 'axios'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')
const WEBHOOK_SECRET = import.meta.env.VITE_TELEBIRR_WEBHOOK_SECRET ?? ''

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
  'Business not found':                 { title: 'Phone not recognised',      hint: 'Check the business phone number and try again.' },
  'Branch not found':                   { title: 'Branch not found',           hint: 'The phone number is not linked to any branch.' },
  'Staff not found':                    { title: 'Invalid staff code',         hint: 'Make sure the staff code is correct for this branch.' },
  'Staff does not belong to this branch': { title: 'Wrong staff code',         hint: 'This staff member is not part of the selected branch.' },
  'No branch assigned':                 { title: 'Branch not configured',      hint: 'Contact your manager — no branch is set up for this account.' },
}

function friendlyError(raw: string) {
  return ERROR_MESSAGES[raw] ?? { title: 'Payment failed', hint: raw }
}

type SuccessData = { transactionId: string; amount: number; tipAmount: number }

export default function Pay() {
  const [form, setForm] = useState({ businessPhone: '+251', staffCode: '', amount: '', tipAmount: '' })
  const [showTip, setShowTip] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [success, setSuccess] = useState<SuccessData | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const amount = parseFloat(form.amount) || 0
  const tip = parseFloat(form.tipAmount) || 0
  const total = amount + tip
  const hasAmount = amount > 0

  function triggerShake() {
    setShaking(true)
    setTimeout(() => setShaking(false), 400)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  if (success) {
    return (
      <div className="min-h-screen bg-lemon-50 flex items-center justify-center p-4">
        <div className="animate-fade-up bg-white rounded-3xl p-10 shadow-sm w-full max-w-sm text-center">
          {/* Animated checkmark */}
          <div className="animate-pop-in flex items-center justify-center w-24 h-24 bg-lemon-400 rounded-full mx-auto mb-6 animate-ring">
            <svg className="w-12 h-12" viewBox="0 0 52 52" fill="none">
              <path
                d="M14 27l8 8 16-16"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="40"
                strokeDashoffset="40"
                style={{ animation: 'draw-check 0.4s ease 0.3s forwards' }}
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
          <p className="text-gray-400 text-sm mb-8">Your transaction has been recorded</p>

          {/* Amount hero */}
          <div className="bg-lemon-50 rounded-2xl px-6 py-5 mb-6 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Amount</span>
              <span className="font-bold text-gray-900 text-lg">ETB {fmt(success.amount)}</span>
            </div>
            {success.tipAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Tip</span>
                <span className="font-semibold text-gray-700">ETB {fmt(success.tipAmount)}</span>
              </div>
            )}
            {success.tipAmount > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-lemon-200">
                <span className="text-gray-600 text-sm font-medium">Total</span>
                <span className="font-bold text-lemon-600 text-lg">ETB {fmt(success.amount + success.tipAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-500 text-sm">Ref</span>
              <span className="font-mono text-xs text-gray-400 truncate max-w-[160px]">{success.transactionId}</span>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white font-semibold py-4 rounded-2xl transition-all duration-150"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lemon-50 flex items-center justify-center p-4">
      <div className="animate-fade-up bg-white rounded-3xl shadow-sm w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-lemon-400 px-8 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Pay with Salesify</h1>
        </div>

        {/* Live amount display */}
        <div className="bg-lemon-50 px-8 py-5 border-b border-lemon-100 text-center transition-all duration-300">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
          <p className={`font-bold transition-all duration-300 ${hasAmount ? 'text-3xl text-gray-900' : 'text-2xl text-gray-300'}`}>
            ETB {fmt(total)}
          </p>
          {tip > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              ETB {fmt(amount)} + ETB {fmt(tip)} tip
            </p>
          )}
        </div>

        {/* Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`px-8 py-6 flex flex-col gap-4 ${shaking ? 'animate-shake' : ''}`}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business Phone</label>
            <input
              type="tel"
              value={form.businessPhone}
              onChange={(e) => {
                const val = e.target.value
                if (val.length <= 13) setForm({ ...form, businessPhone: val })
              }}
              maxLength={13}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-lemon-400 focus:ring-2 focus:ring-lemon-100 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Staff Code</label>
            <input
              type="text"
              placeholder="e.g. 102"
              value={form.staffCode}
              onChange={(e) => setForm({ ...form, staffCode: e.target.value })}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-lemon-400 focus:ring-2 focus:ring-lemon-100 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount (ETB)</label>
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
                className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-lemon-400 focus:ring-2 focus:ring-lemon-100 transition-all duration-200"
              />
            </div>
          </div>

          {/* Tip toggle */}
          {!showTip ? (
            <button
              type="button"
              onClick={() => setShowTip(true)}
              className="text-lemon-500 text-sm font-medium text-left hover:text-lemon-600 transition-colors flex items-center gap-1.5"
            >
              <span className="flex items-center justify-center w-5 h-5 bg-lemon-100 rounded-full text-xs">+</span>
              Add a tip
            </button>
          ) : (
            <div className="flex flex-col gap-1.5 animate-fade-up">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tip (ETB)</label>
                <button
                  type="button"
                  onClick={() => { setShowTip(false); setForm({ ...form, tipAmount: '' }) }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={form.tipAmount}
                  onChange={(e) => setForm({ ...form, tipAmount: e.target.value })}
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-lemon-400 focus:ring-2 focus:ring-lemon-100 transition-all duration-200"
                />
              </div>
            </div>
          )}

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
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="shrink-0 text-red-300 hover:text-red-500 transition-colors mt-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })()}

          <button
            type="submit"
            disabled={loading || !hasAmount}
            className="mt-2 bg-lemon-400 hover:bg-lemon-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all duration-150 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Processing…</span>
              </>
            ) : (
              <span>Pay {hasAmount ? `ETB ${fmt(total)}` : 'Now'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
