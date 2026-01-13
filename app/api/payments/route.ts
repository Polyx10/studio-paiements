import { NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'

export async function GET() {
  try {
    const payments = await db.getPayments()
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error in GET /api/payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payment = await db.addPayment(body)
    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error in POST /api/payments:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
