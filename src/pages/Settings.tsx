import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, LogOut, Trash2 } from 'lucide-react'
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
  const { signOut } = useAuth()
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
      setForm({ name: res.data.name, phone: res.data.phone, email: res.data.email })
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

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Business Info */}
      <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Info</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-medium"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-500">Business Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-500">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-500">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setEditing(false); setSaveError('') }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-1 bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-60"
              >
                {saveLoading ? 'Saving…' : 'Save'}
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
              <div key={label} className="flex items-center justify-between px-5 py-4">
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-gray-900 text-sm font-medium">{value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl shadow-sm mb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 text-gray-700 text-sm font-medium"
        >
          <LogOut size={18} className="text-gray-400" />
          Logout
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Danger Zone</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-gray-500 text-sm mb-4">
            Permanently delete your business, all branches, staff, and transactions. This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-50 text-red-500 text-sm font-medium px-4 py-2.5 rounded-xl"
          >
            <Trash2 size={15} />
            Delete Business
          </button>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <Portal>
          <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Business?</h3>
              <p className="text-gray-500 text-sm mb-6">
                This will permanently delete all your data including staff, branches, and transactions. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-500 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-60"
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
