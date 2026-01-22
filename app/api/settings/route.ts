import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const settings = await db.getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const { access_code } = await request.json()
    
    if (!access_code || typeof access_code !== 'string' || access_code.length > 100) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 400 })
    }
    
    console.warn('Admin updated access code')
    await db.updateAccessCode(access_code)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
