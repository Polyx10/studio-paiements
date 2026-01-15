import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    const adminPassword = process.env.ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not configured')
      return NextResponse.json({ valid: false }, { status: 500 })
    }
    
    const isValid = password.toUpperCase() === adminPassword.toUpperCase()
    
    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Error in POST /api/auth/verify:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
