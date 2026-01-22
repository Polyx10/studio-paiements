import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const { ids } = await request.json()
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid ids array' }, { status: 400 })
    }
    
    console.warn(`Admin deleted ${ids.length} payments`)
    await db.deletePayments(ids)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/payments/bulk-delete:', error)
    return NextResponse.json({ error: 'Failed to delete payments' }, { status: 500 })
  }
}
