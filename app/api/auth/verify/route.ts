import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { valid: false, error: 'Too many attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter)
          }
        }
      )
    }
    
    const { password } = await request.json()
    
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not configured')
      return NextResponse.json({ valid: false }, { status: 500 })
    }
    
    const isValid = password === adminPassword
    
    if (!isValid) {
      console.warn(`Failed login attempt from IP: ${ip}`)
    }
    
    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Error in POST /api/auth/verify:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
