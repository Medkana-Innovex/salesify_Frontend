import { useEffect, useState } from 'react'
import { Plus, X, Pencil, Trash2 } from 'lucide-react'
import * as branchesApi from '../api/branches'
import type { Branch } from '../types'
import Portal from '../components/ui/Portal'

interface BranchModalProps {
  initial?: string
  title: string
  submitLabel: string
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

function BranchModal({ initial = '', title, submitLabel, onClose, onSubmit }: BranchModalProps) {
  const [name, setName] = useState(initial)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit(name.trim())
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 z-[100] flex items-end md:items-center md:justify-center md:p-4">
        <div className="bg-white w-full rounded-t-2xl md:rounded-2xl md:max-w-md">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Branch Name</label>
              <input
                type="text"
                placeholder="e.g. Bole Branch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-lemon-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="pb-2">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-lemon-400 text-gray-900 font-semibold py-3.5 rounded-2xl disabled:opacity-60"
              >
                {loading ? 'Saving…' : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  )
}

interface DeleteConfirmProps {
  branchName: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

function DeleteConfirm({ branchName, onClose, onConfirm }: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to delete')
      setLoading(false)
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Branch?</h3>
          <p className="text-gray-500 text-sm mb-1">
            <span className="font-medium text-gray-700">{branchName}</span> and all its associated data will be permanently deleted.
          </p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-3 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handle}
              disabled={loading}
              className="flex-1 bg-red-500 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [deleting, setDeleting] = useState<Branch | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    branchesApi.listBranches().then((res) => setBranches(res.data)).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (name: string) => {
    const { data } = await branchesApi.createBranch(name)
    setBranches((prev) => [...prev, data])
    setShowAdd(false)
  }

  const handleUpdate = async (name: string) => {
    const { data } = await branchesApi.updateBranch(editing!.id, name)
    setBranches((prev) => prev.map((b) => b.id === editing!.id ? { ...b, ...data } : b))
    setEditing(null)
  }

  const handleToggleActive = async (branch: Branch) => {
    setTogglingId(branch.id)
    try {
      const { data } = branch.isActive
        ? await branchesApi.deactivateBranch(branch.id)
        : await branchesApi.activateBranch(branch.id)
      setBranches((prev) => prev.map((b) => b.id === branch.id ? { ...b, ...data } : b))
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    await branchesApi.deleteBranch(deleting!.id)
    setBranches((prev) => prev.filter((b) => b.id !== deleting!.id))
    setDeleting(null)
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-lemon-400 text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} />
          Add Branch
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-4">{branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No branches yet — add your first branch
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{branch.name}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  branch.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditing(branch)}
                  className="p-2 text-gray-400 hover:text-lemon-600 hover:bg-lemon-50 rounded-lg"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleToggleActive(branch)}
                  disabled={togglingId === branch.id}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 ${
                    branch.isActive
                      ? 'text-red-500 bg-red-50 hover:bg-red-100'
                      : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {branch.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setDeleting(branch)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <BranchModal
          title="Add Branch"
          submitLabel="Add Branch"
          onClose={() => setShowAdd(false)}
          onSubmit={handleCreate}
        />
      )}

      {editing && (
        <BranchModal
          title="Rename Branch"
          submitLabel="Save"
          initial={editing.name}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}

      {deleting && (
        <DeleteConfirm
          branchName={deleting.name}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
