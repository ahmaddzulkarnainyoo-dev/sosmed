// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Penyimpanan sementara (gunakan Redis di production)
// Untuk development, kita pakai Map sederhana
const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  // Ambil IP pengguna (bisa juga dari header 'x-forwarded-for')
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const path = request.nextUrl.pathname

  // Abaikan rate limiting untuk aset statis (gambar, css, dll)
  if (path.match(/\.(ico|css|js|png|jpg|svg)$/)) {
    return NextResponse.next()
  }

  const now = Date.now()
  const record = rateLimit.get(ip)

  // Aturan: maksimal 30 request per 10 detik per IP
  const LIMIT = 30
  const WINDOW_MS = 10_000

  if (!record || now > record.resetTime) {
    // Reset hitungan
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return NextResponse.next()
  }

  if (record.count >= LIMIT) {
    // Rate limit terlampaui
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests, slow down!' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  record.count++
  return NextResponse.next()
}

// Opsional: tentukan route mana saja yang menggunakan middleware
export const config = {
  matcher: ['/api/:path*', '/feed', '/post/:path*'], // sesuaikan
}