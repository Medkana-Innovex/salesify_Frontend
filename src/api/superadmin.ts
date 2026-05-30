import axios from 'axios'
import { loaderStart, loaderDone } from '../components/ui/TopLoader'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

const client = axios.create({ baseURL: BASE })

client.interceptors.request.use((config) => {
  loaderStart()
  const token = localStorage.getItem('saToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => { loaderDone(); return res },
  (err) => { loaderDone(); return Promise.reject(err) }
)

export const saLogin = (phone: string, password: string) =>
  client.post('/superadmin/auth/login', { phone, password })

export const saGetInsights = () =>
  client.get('/superadmin/insights')

export const saListBusinesses = () =>
  client.get('/superadmin/businesses')

export const saGetBusiness = (id: string) =>
  client.get(`/superadmin/businesses/${id}`)

export const saGetConfig = () =>
  client.get('/superadmin/config')

export const saUpdateConfig = (feeAmount: number, minTxAmount: number) =>
  client.patch('/superadmin/config', { feeAmount, minTxAmount })
