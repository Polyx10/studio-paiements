import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'
import { verifyAdminAuth, unauthorizedResponse, validatePaymentData } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const payments = await db.getPayments()
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error in GET /api/payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifyAdminAuth(request)
  if (!isAuthenticated) {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()
    
    const validation = validatePaymentData(body)
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 })
    }
    
    const payment = await db.addPayment(body)
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error in POST /api/payments:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
