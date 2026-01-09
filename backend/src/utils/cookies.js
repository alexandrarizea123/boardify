export const AUTH_COOKIE_NAME = 'boardify_session'
export const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS) || 14

export const serializeCookie = (name, value, options = {}) => {
    const segments = [`${name}=${encodeURIComponent(value)}`]
    if (options.maxAge != null) segments.push(`Max-Age=${options.maxAge}`)
    if (options.path) segments.push(`Path=${options.path}`)
    if (options.httpOnly) segments.push('HttpOnly')
    if (options.secure) segments.push('Secure')
    if (options.sameSite) segments.push(`SameSite=${options.sameSite}`)
    return segments.join('; ')
}

export const setAuthCookie = (res, token, { maxAgeSeconds } = {}) => {
    const isProd = process.env.NODE_ENV === 'production'
    res.setHeader(
        'Set-Cookie',
        serializeCookie(AUTH_COOKIE_NAME, token, {
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
            secure: isProd,
            maxAge: maxAgeSeconds,
        }),
    )
}

export const clearAuthCookie = (res) => {
    res.setHeader(
        'Set-Cookie',
        serializeCookie(AUTH_COOKIE_NAME, '', {
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0,
        }),
    )
}

export const parseCookies = (header) => {
    const input = String(header || '')
    if (!input) return {}
    return input.split(';').reduce((acc, part) => {
        const [rawKey, ...rest] = part.trim().split('=')
        if (!rawKey) return acc
        acc[rawKey] = decodeURIComponent(rest.join('=') || '')
        return acc
    }, {})
}
