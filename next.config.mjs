/** @type {import('next').NextConfig} */
const normalizeProxyTarget = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) return ''
  return raw.replace(/\/+$/, '')
}

const nextConfig = {
  async rewrites() {
    const target = normalizeProxyTarget(
      process.env.API_PROXY_TARGET ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:3000',
    )
    if (!target) return []

    return [
      {
        source: '/api/:path*',
        destination: `${target}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
