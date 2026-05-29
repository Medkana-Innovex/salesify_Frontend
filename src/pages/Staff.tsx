import { useEffect, useState } from 'react'
import { Search, Plus, X, Users, Eye, EyeOff } from 'lucide-react'
import * as staffApi from '../api/staff'
import * as branchesApi from '../api/branches'
import type { Staff, Branch } from '../types'
import { useAuth } from '../context/AuthContext'
import Portal from '../components/ui/Portal'

function Avatar({ name, role }: { name: string; role: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const isBM = role === 'branch_manager'
  return (
    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
      isBM ? 'bg-lemon-400 text-white' : 'bg-lemon-100 text-lemon-600'
    }`}>
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
  const [showPin, setShowPin] = useState(false)
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
        payload.phone = form.phone
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
        <div className="bg-white w-full rounded-t-3xl md:rounded-2xl md:max-w-md flex flex-col max-h-[90vh]">

          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add Staff Member</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex flex-col gap-4 overflow-y-auto px-6 py-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dawit Mekonnen"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
                {creatorRole === 'general_manager' ? (
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value, pin: '' })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                  >
                    <option value="branch_manager">Branch Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                ) : (
                  <div className="border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 bg-gray-50">Staff</div>
                )}
              </div>

              {creatorRole === 'general_manager' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Branch</label>
                  <select
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                  >
                    <option value="">Select branch</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}

              {form.role === 'branch_manager' ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+251912345678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        placeholder="Min 4 characters"
                        value={form.pin}
                        onChange={(e) => setForm({ ...form, pin: e.target.value })}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                      />
                      <button type="button" onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPin ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Staff Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 101"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      required
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+251912345678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-60 transition-all duration-150"
              >
                {loading ? 'Adding…' : 'Add Staff Member'}
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

  const activeCount = staffList.filter((s) => s.isActive).length

  const handleToggleActive = async (staff: Staff) => {
    try {
      const { data } = staff.isActive
        ? await staffApi.deactivateStaff(staff.id)
        : await staffApi.activateStaff(staff.id)
      setStaffList((prev) => prev.map((s) => s.id === staff.id ? { ...s, ...data } : s))
    } catch {}
  }

  return (
    <div className="px-4 pt-6 pb-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          {!loading && (
            <p className="text-sm text-gray-400 mt-0.5">{activeCount} active · {staffList.length - activeCount} inactive</p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-lemon-400 hover:bg-lemon-500 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lemon-400 bg-white"
        />
      </div>

      {/* Role filter */}
      {user?.role === 'general_manager' && (
        <div className="flex gap-2 mb-5">
          {(['all', 'branch_manager', 'staff'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                roleFilter === r
                  ? 'bg-lemon-400 text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-lemon-300'
              }`}
            >
              {r === 'all' ? 'All' : r === 'branch_manager' ? 'Managers' : 'Staff'}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">
            {search ? 'No staff match your search' : 'No staff yet'}
          </p>
          <p className="text-sm text-gray-400">
            {search ? 'Try a different name or code' : 'Add your first staff member to get started'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
          {filtered.map((staff) => (
            <div key={staff.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow duration-200">
              <Avatar name={staff.fullName} role={staff.role} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">{staff.fullName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    staff.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{staff.role.replace('_', ' ')}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {staff.branch?.name && <span className="text-xs text-gray-400">{staff.branch.name}</span>}
                  {staff.code && <span className="text-xs font-semibold text-lemon-600 bg-lemon-50 px-2 py-0.5 rounded-full">#{staff.code}</span>}
                  {staff.phone && <span className="text-xs text-gray-400">{staff.phone}</span>}
                </div>
              </div>
              <button
                onClick={() => handleToggleActive(staff)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 transition-colors ${
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
