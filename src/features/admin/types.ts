export interface PortfolioClient {
  id: string
  name: string
  email: string
  project_count: number
  status: string
  created_at: string
  updated_at: string
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

export interface LineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
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

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  status: string
  created_at: string
}

export interface ActivityEntry {
  id: string
  user_id: string
  action: string
  client_name: string | null
  performed_by: string | null
  created_at: string
  details: string | null
  project_name: string | null
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  business_name: string | null
  message: string | null
  status: string
  source: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'

export type InvoiceStatus = 'paid' | 'pending' | 'overdue'
export type ProjectStatus = 'pending' | 'active' | 'completed'
export type TicketStatus = 'open' | 'in-progress' | 'resolved'
export type ClientStatus = 'active' | 'inactive' | 'lead'

export interface BillingSummary {
  mrr: number
  totalRevenue: number
  overdueTotal: number
  paidCount: number
  pendingCount: number
  overdueCount: number
}

export interface MonitoringClient {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'down'
  project_count: number
}

export interface RevenueEntry {
  id: string
  client_name: string
  description: string
  amount: number
  category: 'service' | 'product' | 'consulting' | 'retainer' | 'other'
  recorded_at: string
  created_at: string
}

export interface ExpenseEntry {
  id: string
  vendor: string
  description: string
  amount: number
  category:
    | 'software'
    | 'hosting'
    | 'contractor'
    | 'travel'
    | 'office'
    | 'marketing'
    | 'other'
  recorded_at: string
  receipt_url?: string
  created_at: string
}

export interface BusinessSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  revenueByCategory: Record<string, number>
  expensesByCategory: Record<string, number>
  revenueCount: number
  expenseCount: number
  thisMonthRevenue: number
  thisMonthExpenses: number
}

export type RevenueCategory =
  | 'service'
  | 'product'
  | 'consulting'
  | 'retainer'
  | 'other'
export type ExpenseCategory =
  | 'software'
  | 'hosting'
  | 'contractor'
  | 'travel'
  | 'office'
  | 'marketing'
  | 'other'
