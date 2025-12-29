const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const hasApi = API_BASE_URL.length > 0

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
  if (!hasApi) {
    const error = new Error('API disabled')
    error.status = 0
    throw error
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

