import { NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'

export async function GET() {
  try {
    const settings = await db.getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { access_code } = await request.json()
    await db.updateAccessCode(access_code)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PUT /api/settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
