import { NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'

export async function POST(request: Request) {
  try {
    const { ids } = await request.json()
    await db.deletePayments(ids)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/payments/bulk-delete:', error)
    return NextResponse.json({ error: 'Failed to delete payments' }, { status: 500 })
  }
}
