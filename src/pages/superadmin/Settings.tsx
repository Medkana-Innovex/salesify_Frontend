import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings2, Info } from 'lucide-react'
import { saGetConfig, saUpdateConfig } from '../../api/superadmin'
import SuperAdminLayout from '../../components/layout/SuperAdminLayout'

export default function SuperAdminSettings() {
  const navigate = useNavigate()
  const [feeForm, setFeeForm] = useState({ feeAmount: '', minTxAmount: '' })
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    saGetConfig()
      .then((res) => setFeeForm({ feeAmount: res.data.feeAmount, minTxAmount: res.data.minTxAmount }))
      .catch((err) => {
        if (err.response?.status === 401) navigate('/superadmin/login')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setError('')
    setSaveLoading(true)
    setSaveSuccess(false)
    try {
      await saUpdateConfig(parseFloat(feeForm.feeAmount), parseFloat(feeForm.minTxAmount))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to save')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <SuperAdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Platform-wide configuration</p>
      </div>

      {loading ? (
        <div className="h-48 bg-white rounded-2xl animate-pulse" />
      ) : (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-lemon-50 rounded-xl flex items-center justify-center">
                <Settings2 size={18} className="text-lemon-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Platform Fee</p>
                <p className="text-xs text-gray-400">Applied to all qualifying transactions</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fee Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ETB</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={feeForm.feeAmount}
                    onChange={(e) => setFeeForm({ ...feeForm, feeAmount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Minimum Transaction Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ETB</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={feeForm.minTxAmount}
                    onChange={(e) => setFeeForm({ ...feeForm, minTxAmount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-start gap-2.5 bg-lemon-50 rounded-xl px-4 py-3">
                <Info size={15} className="text-lemon-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-lemon-700 leading-relaxed">
                  Transactions of <strong>ETB {feeForm.minTxAmount || '?'} or more</strong> will be charged a platform fee of <strong>ETB {feeForm.feeAmount || '?'}</strong>. The merchant receives the remainder.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="bg-lemon-400 hover:bg-lemon-500 active:scale-95 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-all duration-150"
              >
                {saveLoading ? 'Saving…' : saveSuccess ? '✓ Saved successfully' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  )
}
