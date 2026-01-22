import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const history = await db.getPaymentHistory()
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error in GET /api/payments/history:', error)
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 })
  }
}
