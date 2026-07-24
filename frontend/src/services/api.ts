import axios from 'axios'

const AUTH_STORAGE_KEY = 'leadflow.auth'
export const UNAUTHORIZED_EVENT = 'leadflow:unauthorized'

const api = axios.create({
  baseURL: '/api',
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
    if (error.response?.status === 401) {
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
