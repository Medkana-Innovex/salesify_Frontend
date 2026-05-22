import { useEffect, useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import * as staffApi from '../api/staff'
import * as branchesApi from '../api/branches'
import type { Staff, Branch } from '../types'
import { useAuth } from '../context/AuthContext'
import Portal from '../components/ui/Portal'

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
      {initials}
    </div>
  )
}

interface AddStaffModalProps {
  branches: Branch[]
  creatorRole: string
  onClose: () => void
  onCreated: (staff: Staff) => void
}

function AddStaffModal({ branches, creatorRole, onClose, onCreated }: AddStaffModalProps) {
  const defaultRole = creatorRole === 'general_manager' ? 'branch_manager' : 'staff'
  const [form, setForm] = useState({ fullName: '', code: '', phone: '+251', pin: '', role: defaultRole, branchId: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload: any = { fullName: form.fullName, role: form.role, branchId: form.branchId || undefined }
      if (form.role === 'branch_manager') {
        payload.phone = form.phone
        payload.pin = form.pin
      } else {
        payload.code = form.code
      }
      const { data } = await staffApi.createStaff(payload)
      onCreated(data)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Portal>
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-end md:items-center md:justify-center md:p-4">
      <div className="bg-white w-full rounded-t-2xl md:rounded-2xl md:max-w-md flex flex-col max-h-[90vh]">
        {/* Fixed header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add Staff</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>

        {/* Scrollable fields */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Dawit Mekonnen"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Role</label>
            {creatorRole === 'general_manager' ? (
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value, pin: '' })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="branch_manager">Branch Manager</option>
                <option value="staff">Staff</option>
              </select>
            ) : (
              <div className="border border-gray-200 rounded-xl px-4 py-3 text-gray-500 bg-gray-50">
                Staff
              </div>
            )}
          </div>

          {creatorRole === 'general_manager' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Branch</label>
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {form.role === 'branch_manager' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-600">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-600">Password</label>
                <input
                  type="password"
                  placeholder="Min 4 characters"
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value })}
                  required
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Staff Code</label>
              <input
                type="text"
                placeholder="e.g. 101"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Pinned button */}
        <div className="px-6 pb-6 pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-60"
          >
            {loading ? 'Adding…' : 'Add Staff'}
          </button>
        </div>
        </form>
      </div>
    </div>
    </Portal>
  )
}

export default function Staff() {
  const { user } = useAuth()
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'branch_manager' | 'staff'>('all')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      staffApi.listStaff(),
      user?.role === 'general_manager' ? branchesApi.listBranches() : Promise.resolve({ data: [] }),
    ]).then(([staffRes, branchRes]) => {
      setStaffList(staffRes.data)
      setBranches(branchRes.data)
    }).finally(() => setLoading(false))
  }, [user])

  const filtered = staffList.filter((s) => {
    const matchesSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (s.code ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || s.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleToggleActive = async (staff: Staff) => {
    try {
      const { data } = staff.isActive
        ? await staffApi.deactivateStaff(staff.id)
        : await staffApi.activateStaff(staff.id)
      setStaffList((prev) => prev.map((s) => s.id === staff.id ? { ...s, ...data } : s))
    } catch {}
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Members</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search staff by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {user?.role === 'general_manager' && (
        <div className="flex gap-2 mb-5">
          {(['all', 'branch_manager', 'staff'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                roleFilter === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {r === 'all' ? 'All' : r === 'branch_manager' ? 'Branch Managers' : 'Staff'}
            </button>
          ))}
        </div>
      )}

      <p className="text-gray-500 text-sm mb-4">{filtered.length} staff member{filtered.length !== 1 ? 's' : ''}</p>

      {/* Staff List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {search ? 'No staff match your search' : 'No staff yet — add your first staff member'}
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
          {filtered.map((staff) => (
            <div key={staff.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <Avatar name={staff.fullName} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{staff.fullName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    staff.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">
                  {staff.branch?.name ?? 'No branch'} · Code: <span className="font-semibold text-blue-600">{staff.code ?? '—'}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {staff.role.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={() => handleToggleActive(staff)}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg flex-shrink-0 ${
                  staff.isActive
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                }`}
              >
                {staff.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddStaffModal
          branches={branches}
          creatorRole={user?.role ?? 'staff'}
          onClose={() => setShowModal(false)}
          onCreated={(newStaff) => {
            setStaffList((prev) => [...prev, newStaff])
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
