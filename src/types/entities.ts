/**
 * Shared domain entity types used by both the admin and client portals. Kept
 * in a neutral location so neither portal has to import from the other's
 * feature folder.
 */

export interface LineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export interface Invoice {
  id: string
  client_name: string
  client_id?: string
  amount: number
  status: string
  date: string
  created_at: string
  invoice_number?: string
  due_date?: string | null
  paid_at?: string | null
  line_items?: LineItem[]
}

export interface Project {
  id: string
  client_id: string
  name: string
  description: string | null
  status: string
  deadline: string | null
  progress: number | null
  created_at: string
}
