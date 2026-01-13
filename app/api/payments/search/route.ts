import { NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const birthDate = searchParams.get('birthDate')

    if (!name || !birthDate) {
      return NextResponse.json({ error: 'Missing name or birthDate' }, { status: 400 })
    }

    const payment = await db.findPayment(name, birthDate)
    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error in GET /api/payments/search:', error)
    return NextResponse.json({ error: 'Failed to search payment' }, { status: 500 })
  }
}
