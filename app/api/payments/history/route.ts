import { NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'

export async function GET() {
  try {
    const history = await db.getPaymentHistory()
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error in GET /api/payments/history:', error)
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 })
  }
}
