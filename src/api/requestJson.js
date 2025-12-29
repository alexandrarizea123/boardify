const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const apiDisabled = process.env.NEXT_PUBLIC_API_DISABLED === 'true'

const readErrorMessage = async (response) => {
  try {
    const data = await response.json()
    if (data?.error) return String(data.error)
  } catch {
    // ignore
  }
  try {
    const text = await response.text()
    if (text) return text
  } catch {
    // ignore
  }
  return 'Request failed'
}

export const requestJson = async (path, options = {}) => {
  if (apiDisabled) {
    const error = new Error('API disabled')
    error.status = 0
    throw error
  }

  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await readErrorMessage(response)
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}
