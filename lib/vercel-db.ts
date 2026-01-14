import { neon } from '@neondatabase/serverless'
import type { Payment, Settings } from './types'

function getSql() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set')
  }
  return neon(process.env.POSTGRES_URL)
}

export const db = {
  async getPayments(): Promise<Payment[]> {
    try {
      const sql = getSql()
      const rows = await sql`SELECT * FROM payments ORDER BY created_at DESC`
      return rows as Payment[]
    } catch (error) {
      console.error('Error getting payments:', error)
      return []
    }
  },

  async findPayment(name: string, birthDate: string): Promise<Payment | null> {
    try {
      const sql = getSql()
      // Recherche par les 3 premières lettres du nom (insensible à la casse)
      const searchPattern = `${name.substring(0, 3).toLowerCase()}%`
      const rows = await sql`
        SELECT * FROM payments 
        WHERE LOWER(name) LIKE ${searchPattern}
        AND birth_date = ${birthDate}
        LIMIT 1
      `
      return rows[0] as Payment || null
    } catch (error) {
      console.error('Error finding payment:', error)
      return null
    }
  },

  async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const sql = getSql()
    const rows = await sql`
      INSERT INTO payments (name, birth_date, amount, reason, is_paid, paid_date)
      VALUES (${payment.name}, ${payment.birth_date}, ${payment.amount}, ${payment.reason}, ${payment.is_paid}, ${payment.paid_date || null})
      RETURNING *
    `
    return rows[0] as Payment
  },

  async updatePayment(id: string, data: Partial<Omit<Payment, 'id' | 'created_at'>>): Promise<Payment | null> {
    try {
      const sql = getSql()
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`)
        values.push(data.name)
      }
      if (data.birth_date !== undefined) {
        updates.push(`birth_date = $${paramIndex++}`)
        values.push(data.birth_date)
      }
      if (data.amount !== undefined) {
        updates.push(`amount = $${paramIndex++}`)
        values.push(data.amount)
      }
      if (data.reason !== undefined) {
        updates.push(`reason = $${paramIndex++}`)
        values.push(data.reason)
      }
      if (data.is_paid !== undefined) {
        updates.push(`is_paid = $${paramIndex++}`)
        values.push(data.is_paid)
      }
      if (data.paid_date !== undefined) {
        updates.push(`paid_date = $${paramIndex++}`)
        values.push(data.paid_date)
      }

      if (updates.length === 0) return null

      // Pour simplifier, on reconstruit la requête avec les champs modifiables
      const rows = await sql`
        UPDATE payments 
        SET 
          name = COALESCE(${data.name}, name),
          birth_date = COALESCE(${data.birth_date}, birth_date),
          amount = COALESCE(${data.amount}, amount),
          reason = COALESCE(${data.reason}, reason),
          is_paid = COALESCE(${data.is_paid}, is_paid),
          paid_date = COALESCE(${data.paid_date}, paid_date)
        WHERE id = ${id}
        RETURNING *
      `
      return rows[0] as Payment
    } catch (error) {
      console.error('Error updating payment:', error)
      return null
    }
  },

  async deletePayment(id: string): Promise<boolean> {
    try {
      const sql = getSql()
      await sql`DELETE FROM payments WHERE id = ${id}`
      return true
    } catch (error) {
      console.error('Error deleting payment:', error)
      return false
    }
  },

  async deletePayments(ids: string[]): Promise<boolean> {
    try {
      const sql = getSql()
      await sql`DELETE FROM payments WHERE id = ANY(${ids})`
      return true
    } catch (error) {
      console.error('Error deleting payments:', error)
      return false
    }
  },

  async markAsPaid(id: string): Promise<boolean> {
    try {
      const sql = getSql()
      const now = new Date().toISOString()
      await sql`
        UPDATE payments 
        SET is_paid = true, paid_date = ${now}
        WHERE id = ${id}
      `
      return true
    } catch (error) {
      console.error('Error marking payment as paid:', error)
      return false
    }
  },

  async getPaymentHistory(): Promise<Payment[]> {
    try {
      const sql = getSql()
      const rows = await sql`
        SELECT * FROM payments 
        WHERE is_paid = true 
        ORDER BY paid_date DESC
      `
      return rows as Payment[]
    } catch (error) {
      console.error('Error getting payment history:', error)
      return []
    }
  },

  async getSettings(): Promise<Settings> {
    try {
      const sql = getSql()
      const rows = await sql`SELECT * FROM settings LIMIT 1`
      if (rows.length === 0) {
        await sql`INSERT INTO settings (access_code) VALUES ('STUDIO2026')`
        return { access_code: 'STUDIO2026' }
      }
      return rows[0] as Settings
    } catch (error) {
      console.error('Error getting settings:', error)
      return { access_code: 'STUDIO2026' }
    }
  },

  async updateAccessCode(code: string): Promise<boolean> {
    try {
      const sql = getSql()
      await sql`UPDATE settings SET access_code = ${code}`
      return true
    } catch (error) {
      console.error('Error updating access code:', error)
      return false
    }
  },

  async initDatabase(): Promise<void> {
    const sql = getSql()
    
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT NOT NULL,
        is_paid BOOLEAN DEFAULT false,
        paid_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        access_code TEXT NOT NULL DEFAULT 'STUDIO2026'
      )
    `

    const settingsRows = await sql`SELECT COUNT(*) as count FROM settings`
    if (settingsRows[0].count === 0) {
      await sql`INSERT INTO settings (access_code) VALUES ('STUDIO2026')`
    }
  }
}
