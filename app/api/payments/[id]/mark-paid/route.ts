import { NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.markAsPaid(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/payments/[id]/mark-paid:', error)
    return NextResponse.json({ error: 'Failed to mark payment as paid' }, { status: 500 })
  }
}
