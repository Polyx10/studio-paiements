import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'
import { verifyAdminAuth, unauthorizedResponse, validatePaymentData } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await params
    const body = await request.json()
    
    const validation = validatePaymentData(body)
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 })
    }
    
    const payment = await db.updatePayment(id, body)
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    console.warn(`Admin updated payment: ${id}`)
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error in PUT /api/payments/[id]:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await params
    const body = await request.json()
    const payment = await db.updatePayment(id, body)
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    console.warn(`Admin patched payment: ${id}`)
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error in PATCH /api/payments/[id]:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const { id } = await params
    console.warn(`Admin deleted payment: ${id}`)
    await db.deletePayment(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/payments/[id]:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}
