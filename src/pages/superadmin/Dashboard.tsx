import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, GitBranch } from 'lucide-react'
import { saListBusinesses } from '../../api/superadmin'
import SuperAdminLayout from '../../components/layout/SuperAdminLayout'

interface Business {
  id: string
  name: string
  phone: string
  email: string | null
  branchCount: number
  createdAt: string
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const LIMIT = 15

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    saListBusinesses(1, LIMIT)
      .then((res) => {
        setBusinesses(res.data.data)
        setHasMore(res.data.hasMore)
      })
      .catch((err) => { if (err.response?.status === 401) navigate('/superadmin/login') })
      .finally(() => setLoading(false))
  }, [])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await saListBusinesses(nextPage, LIMIT)
      setBusinesses((prev) => [...prev, ...res.data.data])
      setHasMore(res.data.hasMore)
      setPage(nextPage)
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/superadmin/login')
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <SuperAdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
          {!loading && <p className="text-sm text-gray-400 mt-0.5">{businesses.length} registered</p>}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Building2 size={24} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600">No businesses yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/superadmin/businesses/${b.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 text-left flex items-center gap-3"
            >
              <div className="w-11 h-11 bg-lemon-400 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {initials(b.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{b.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{b.phone}</p>
                {b.email && <p className="text-xs text-gray-400">{b.email}</p>}
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="flex items-center gap-1 bg-lemon-50 text-lemon-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <GitBranch size={10} />
                  {b.branchCount}
                </div>
                <p className="text-xs text-gray-300">
                  {new Date(b.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </button>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="md:col-span-2 w-full py-3 text-sm font-medium text-lemon-600 bg-lemon-50 hover:bg-lemon-100 rounded-2xl transition-colors disabled:opacity-60"
            >
              {loadingMore ? 'Loading…' : 'Load More'}
            </button>
          )}
        </div>
      )}
    </SuperAdminLayout>
  )
}
