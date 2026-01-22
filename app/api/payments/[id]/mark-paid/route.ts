import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await params
    console.warn(`Admin marked payment as paid: ${id}`)
    await db.markAsPaid(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/payments/[id]/mark-paid:', error)
    return NextResponse.json({ error: 'Failed to mark payment as paid' }, { status: 500 })
  }
}
