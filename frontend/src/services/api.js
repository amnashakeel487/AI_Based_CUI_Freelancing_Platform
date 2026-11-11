/**
 * API client for backend requests.
 * Automatically adds authentication token and handles errors.
 */
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

class APIError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.status = status
  }
}

/**
 * Make an authenticated API request.
 * Times out after 10 seconds to prevent infinite loading.
 */
export async function apiRequest(endpoint, options = {}) {
  // Get current session token
  const { data: { session } } = await supabase.auth.getSession()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const config = { ...options, headers }

  // 10-second timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...config,
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) throw new APIError('An error occurred', 'NETWORK_ERROR', response.status)
      return null
    }

    const data = await response.json()
    if (!response.ok) {
      const message = data.detail || data.message || 'An error occurred'
      const code = data.code || 'UNKNOWN_ERROR'
      throw new APIError(message, code, response.status)
    }
    return data
  } catch (error) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      throw new APIError('Request timed out. Is the backend running?', 'TIMEOUT', 0)
    }
    if (error instanceof APIError) throw error
    throw new APIError(error.message || 'Network error', 'NETWORK_ERROR', 0)
  }
}

/**
 * GET request
 */
export async function get(endpoint) {
  return apiRequest(endpoint, { method: 'GET' })
}

/**
 * POST request
 */
export async function post(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT request
 */
export async function put(endpoint, data) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request
 */
export async function del(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' })
}

export { APIError }
