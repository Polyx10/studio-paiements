export interface Payment {
  id: string
  name: string
  birth_date: string
  amount: number
  reason: string
  is_paid: boolean
  paid_date?: string
  created_at: string
}

export interface Settings {
  access_code: string
}
