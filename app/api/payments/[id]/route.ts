import { NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const payment = await db.updatePayment(id, body)
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error in PUT /api/payments/[id]:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.deletePayment(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/payments/[id]:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}
