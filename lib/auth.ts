import { NextRequest, NextResponse } from 'next/server'

export async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7)
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured')
    return false
  }
  
  return token === adminPassword
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized - Admin authentication required' },
    { status: 401 }
  )
}

export function validatePaymentData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required and must be a string')
  } else if (data.name.length > 200) {
    errors.push('Name must be less than 200 characters')
  }
  
  if (data.birth_date !== undefined && data.birth_date !== null && data.birth_date !== '') {
    if (typeof data.birth_date !== 'string') {
      errors.push('Birth date must be a string')
    } else if (data.birth_date.length > 50) {
      errors.push('Birth date must be less than 50 characters')
    }
  }
  
  if (data.amount !== undefined && data.amount !== null) {
    if (typeof data.amount !== 'number' || data.amount < 0 || data.amount > 10000) {
      errors.push('Amount must be a number between 0 and 10000')
    }
  }
  
  if (data.reason !== undefined && data.reason !== null && data.reason !== '') {
    if (typeof data.reason !== 'string') {
      errors.push('Reason must be a string')
    } else if (data.reason.length > 500) {
      errors.push('Reason must be less than 500 characters')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function sanitizeForExcel(value: string): string {
  if (typeof value !== 'string') return String(value)
  
  const trimmed = value.trim()
  
  if (trimmed.startsWith('=') || 
      trimmed.startsWith('+') || 
      trimmed.startsWith('-') || 
      trimmed.startsWith('@') ||
      trimmed.startsWith('\t') ||
      trimmed.startsWith('\r')) {
    return "'" + trimmed
  }
  
  return trimmed
}
