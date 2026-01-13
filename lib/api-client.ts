import type { Payment } from './types'

export const db = {
  async getAccessCode(): Promise<string> {
    const res = await fetch('/api/settings')
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
    const res = await fetch('/api/payments')
    return res.json()
  },

  async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    })
    return res.json()
  },

  async updatePayment(id: string, data: Partial<Omit<Payment, 'id' | 'created_at'>>): Promise<Payment | null> {
    const res = await fetch(`/api/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) return null
    return res.json()
  },

  async deletePayment(id: string): Promise<boolean> {
    const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' })
    return res.ok
  },

  async deletePayments(ids: string[]): Promise<boolean> {
    const res = await fetch('/api/payments/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    })
    return res.ok
  },

  async markAsPaid(id: string): Promise<boolean> {
    const res = await fetch(`/api/payments/${id}/mark-paid`, {
      method: 'POST'
    })
    return res.ok
  },

  async getPaymentHistory(): Promise<Payment[]> {
    const res = await fetch('/api/payments/history')
    return res.json()
  },

  async updateAccessCode(code: string): Promise<boolean> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_code: code })
    })
    return res.ok
  }
}
