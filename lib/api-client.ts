import type { Payment } from './types'

let adminToken: string | null = null

export function setAdminToken(token: string) {
  adminToken = token
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`
  }
  return headers
}

export const db = {
  async getAccessCode(): Promise<string> {
    const res = await fetch('/api/settings', {
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    })
    const data = await res.json()
    return data.access_code || 'STUDIO2026'
  },

  async findPayment(name: string, birthDate: string): Promise<Payment | null> {
    const res = await fetch(`/api/payments/search?name=${encodeURIComponent(name)}&birthDate=${encodeURIComponent(birthDate)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.payment || null
  },

  async getPayments(): Promise<Payment[]> {
    const res = await fetch('/api/payments', {
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    })
    return res.json()
  },

  async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payment)
    })
    return res.json()
  },

  async updatePayment(id: string, data: Partial<Omit<Payment, 'id' | 'created_at'>>): Promise<Payment | null> {
    const res = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!res.ok) return null
    return res.json()
  },

  async deletePayment(id: string): Promise<boolean> {
    const res = await fetch(`/api/payments/${id}`, {
      method: 'DELETE',
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    })
    return res.ok
  },

  async deletePayments(ids: string[]): Promise<boolean> {
    const res = await fetch('/api/payments/bulk-delete', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids })
    })
    return res.ok
  },

  async markAsPaid(id: string): Promise<boolean> {
    const res = await fetch(`/api/payments/${id}/mark-paid`, {
      method: 'POST',
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    })
    return res.ok
  },

  async getPaymentHistory(): Promise<Payment[]> {
    const res = await fetch('/api/payments/history', {
      headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}
    })
    return res.json()
  },

  async updateAccessCode(code: string): Promise<boolean> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ access_code: code })
    })
    return res.ok
  }
}
