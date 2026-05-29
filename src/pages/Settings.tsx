import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, LogOut, Trash2, Building2, X } from 'lucide-react'
import * as businessApi from '../api/business'
import * as authApi from '../api/auth'
import { useAuth } from '../context/AuthContext'
import Portal from '../components/ui/Portal'

interface Business {
  id: string
  name: string
  phone: string
  email: string
}

export default function Settings() {
  const { signOut, user, businessName } = useAuth()
  const isGM = user?.role === 'general_manager'
  const navigate = useNavigate()

  const [business, setBusiness] = useState<Business | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    businessApi.getProfile().then((res) => {
      setBusiness(res.data)
      setForm({ name: res.data.name, phone: res.data.phone, email: res.data.email ?? '' })
    })
  }, [])

  const handleSave = async () => {
    setSaveError('')
    setSaveLoading(true)
    try {
      const { data } = await businessApi.updateProfile(form)
      setBusiness(data)
      setEditing(false)
    } catch (err: any) {
      setSaveError(err.response?.data?.message ?? 'Failed to update')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {})
    signOut()
    navigate('/')
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await businessApi.deleteBusiness()
      signOut()
      navigate('/')
    } catch {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const avatarInitials = (businessName ?? business?.name ?? '?').slice(0, 2).toUpperCase()

  return (
    <div className="px-4 pt-6 pb-6 max-w-lg mx-auto">

      {/* Profile header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 bg-lemon-400 rounded-2xl flex items-center justify-center mb-3">
          <span className="text-white font-bold text-xl">{avatarInitials}</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900">{business?.name ?? '—'}</h2>
        <span className="text-xs text-gray-400 mt-0.5 capitalize">
          {user?.role?.replace('_', ' ')}
        </span>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 size={15} className="text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">Business Info</p>
          </div>
          {!editing && isGM && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-lemon-600 text-sm font-medium hover:text-lemon-700 transition-colors"
            >
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
              />
            </div>
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{saveError}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setEditing(false); setSaveError('') }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-1 bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-60 transition-all duration-150"
              >
                {saveLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[
              { label: 'Business Name', value: business?.name },
              { label: 'Phone', value: business?.phone },
              { label: 'Email', value: business?.email },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5">
                <p className="text-sm text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl shadow-sm mb-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 text-gray-700 text-sm font-medium hover:bg-gray-50 rounded-2xl transition-colors"
        >
          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
            <LogOut size={16} className="text-gray-500" />
          </div>
          Logout
        </button>
      </div>

      {/* Danger Zone — GM only */}
      {isGM && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-50">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Danger Zone</p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Delete Business</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently removes all data</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <Portal>
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-fade-up">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Business?</h3>
              <p className="text-gray-500 text-sm mb-6">
                All staff, branches, and transactions will be permanently deleted. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-60 transition-colors"
                >
                  {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
