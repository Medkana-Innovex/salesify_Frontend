import axios from 'axios'
import { loaderStart, loaderDone } from '../components/ui/TopLoader'

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1' })

client.interceptors.request.use((config) => {
  loaderStart()
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => { loaderDone(); return res },
  async (error) => {
    loaderDone()
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken })
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return client(original)
        } catch {
          localStorage.clear()
          window.location.href = '/'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default client
