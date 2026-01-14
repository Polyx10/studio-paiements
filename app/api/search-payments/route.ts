import { NextResponse } from 'next/server'
import { db } from '@/lib/vercel-db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (query.length < 3) {
      return NextResponse.json([])
    }
    
    const results = await db.searchPaymentsByName(query)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in GET /api/search-payments:', error)
    return NextResponse.json({ error: 'Failed to search payments' }, { status: 500 })
  }
}
