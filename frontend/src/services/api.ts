import axios from 'axios'

const AUTH_STORAGE_KEY = 'leadflow.auth'
export const UNAUTHORIZED_EVENT = 'leadflow:unauthorized'

// In production (Vercel), call the Railway backend directly.
// In local dev, use the Vite dev-server proxy (/api → localhost:8081).
const DEFAULT_API_URL = import.meta.env.PROD
  ? 'https://leadflowcrm-production.up.railway.app/api'
  : '/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (rawSession) {
    try {
      const parsedSession = JSON.parse(rawSession) as { accessToken?: string }
      if (parsedSession.accessToken) {
        config.headers.Authorization = `Bearer ${parsedSession.accessToken}`
      }
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const requestUrl = error.config?.url || ''
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/me')

    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }

    return Promise.reject(error)
  }
)

export const setStoredSession = (session: unknown) => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export const getStoredSession = () => {
  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as { accessToken?: string; user?: unknown }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const clearStoredSession = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export default api
