'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  KPICard,
  Stack,
  Text,
} from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import type {
  RevenueEntry,
  ExpenseEntry,
  BusinessSummary,
} from '@/features/admin/types'
import {
  createRevenueEntry,
  createExpenseEntry,
  deleteRevenueEntry,
  deleteExpenseEntry,
} from './actions'
import styles from './revenue-page.module.css'

interface RevenuePageProps {
  revenues: RevenueEntry[]
  expenses: ExpenseEntry[]
  summary: BusinessSummary
  showRevenueForm: boolean
  showExpenseForm: boolean
}

const revenueCategoryLabels: Record<string, string> = {
  service: 'Service',
  product: 'Product',
  consulting: 'Consulting',
  retainer: 'Retainer',
  other: 'Other',
}

const expenseCategoryLabels: Record<string, string> = {
  software: 'Software',
  hosting: 'Hosting',
  contractor: 'Contractor',
  travel: 'Travel',
  office: 'Office',
  marketing: 'Marketing',
  other: 'Other',
}

function formatAmount(cents: number) {
  const abs = Math.abs(cents)
  const formatted = `$${(abs / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  return cents < 0 ? `-${formatted}` : formatted
}

export default function RevenuePage({
  revenues,
  expenses,
  summary,
  showRevenueForm,
  showExpenseForm,
}: RevenuePageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'revenue' | 'expenses'>('revenue')

  const {
    page: revPage,
    setPage: setRevPage,
    totalPages: revTotalPages,
    pageData: revPageData,
  } = useClientPagination(revenues, 10)

  const {
    page: expPage,
    setPage: setExpPage,
    totalPages: expTotalPages,
    pageData: expPageData,
  } = useClientPagination(expenses, 10)

  const columns = (
    _items: RevenueEntry[] | ExpenseEntry[],
    type: 'revenue' | 'expenses',
  ) => {
    const isRevenue = type === 'revenue'
    const baseColumns = [
      {
        key: 'recorded_at',
        title: 'Date',
        sortable: true,
        render: (value: unknown) => {
          const d = String(value)
          return <span>{new Date(d).toLocaleDateString()}</span>
        },
      },
      isRevenue
        ? { key: 'client_name', title: 'Client', sortable: true }
        : { key: 'vendor', title: 'Vendor', sortable: true },
      { key: 'description', title: 'Description', sortable: true },
      {
        key: 'category',
        title: 'Category',
        sortable: true,
        render: (value: unknown) => {
          const cat = String(value)
          const label = isRevenue
            ? (revenueCategoryLabels[cat] ?? cat)
            : (expenseCategoryLabels[cat] ?? cat)
          return <Badge variant="neutral">{label}</Badge>
        },
      },
      {
        key: 'amount',
        title: 'Amount',
        sortable: true,
        render: (value: unknown) => (
          <span style={{ fontWeight: 600 }}>{formatAmount(Number(value))}</span>
        ),
      },
      {
        key: 'id',
        title: 'Actions',
        render: (value: unknown) => {
          const id = String(value)
          const action = isRevenue ? deleteRevenueEntry : deleteExpenseEntry
          return (
            <form action={action}>
              <input type="hidden" name="id" value={id} />
              <Button variant="tertiary" type="submit">
                Delete
              </Button>
            </form>
          )
        },
      },
    ]
    return baseColumns
  }

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Revenue & Expense Tracking
      </Text>

      <div className={styles.kpiRow}>
        <KPICard
          value={formatAmount(summary.totalRevenue)}
          label="Total Revenue"
          variant="success"
        />
        <KPICard
          value={formatAmount(summary.totalExpenses)}
          label="Total Expenses"
          variant="danger"
        />
        <KPICard
          value={formatAmount(summary.netProfit)}
          label="Net Profit"
          variant={summary.netProfit >= 0 ? 'success' : 'danger'}
        />
        <KPICard
          value={`${summary.profitMargin.toFixed(1)}%`}
          label="Profit Margin"
          variant={
            summary.profitMargin >= 20
              ? 'success'
              : summary.profitMargin >= 0
                ? 'warning'
                : 'danger'
          }
        />
      </div>

      <div className={styles.kpiRow}>
        <Card className={styles.statCard}>
          <Text>
            This Month Revenue: {formatAmount(summary.thisMonthRevenue)}
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <Text>
            This Month Expenses: {formatAmount(summary.thisMonthExpenses)}
          </Text>
        </Card>
        <Card className={styles.statCard}>
          <Text>Revenue Entries: {summary.revenueCount}</Text>
        </Card>
        <Card className={styles.statCard}>
          <Text>Expense Entries: {summary.expenseCount}</Text>
        </Card>
      </div>

      <Card>
        <Stack spacing="sm">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Revenue by Category
          </Text>
          {Object.keys(summary.revenueByCategory).length === 0 ? (
            <Text color="muted">No revenue data.</Text>
          ) : (
            <div className={styles.categoryGrid}>
              {Object.entries(summary.revenueByCategory).map(
                ([cat, amount]) => (
                  <Card key={cat} className={styles.statCard}>
                    <Stack spacing="xs">
                      <Text element={{ size: 'sm' }} color="secondary">
                        {revenueCategoryLabels[cat] ?? cat}
                      </Text>
                      <Text weight="semibold">{formatAmount(amount)}</Text>
                    </Stack>
                  </Card>
                ),
              )}
            </div>
          )}
        </Stack>
      </Card>

      <Card>
        <Stack spacing="sm">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Expenses by Category
          </Text>
          {Object.keys(summary.expensesByCategory).length === 0 ? (
            <Text color="muted">No expense data.</Text>
          ) : (
            <div className={styles.categoryGrid}>
              {Object.entries(summary.expensesByCategory).map(
                ([cat, amount]) => (
                  <Card key={cat} className={styles.statCard}>
                    <Stack spacing="xs">
                      <Text element={{ size: 'sm' }} color="secondary">
                        {expenseCategoryLabels[cat] ?? cat}
                      </Text>
                      <Text weight="semibold">{formatAmount(amount)}</Text>
                    </Stack>
                  </Card>
                ),
              )}
            </div>
          )}
        </Stack>
      </Card>

      <div className={styles.toggleRow}>
        <Button
          variant={activeTab === 'revenue' ? 'primary' : 'tertiary'}
          type="button"
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </Button>
        <Button
          variant={activeTab === 'expenses' ? 'primary' : 'tertiary'}
          type="button"
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </Button>
      </div>

      <div className={styles.sectionHeader}>
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          {activeTab === 'revenue' ? 'Revenue Entries' : 'Expense Entries'}
        </Text>
        <a
          href={
            activeTab === 'revenue'
              ? showRevenueForm
                ? '/admin/revenue'
                : '/admin/revenue?revenueForm=true'
              : showExpenseForm
                ? '/admin/revenue'
                : '/admin/revenue?expenseForm=true'
          }
        >
          <Button variant="primary" type="button">
            {activeTab === 'revenue'
              ? showRevenueForm
                ? 'Cancel'
                : 'Add Revenue'
              : showExpenseForm
                ? 'Cancel'
                : 'Add Expense'}
          </Button>
        </a>
      </div>

      {activeTab === 'revenue' && showRevenueForm && (
        <Card>
          <form
            action={async (formData) => {
              const result = await createRevenueEntry(null, formData)
              if (result?.error) {
                alert(result.error)
              } else {
                router.push('/admin/revenue')
              }
            }}
          >
            <Stack spacing="sm">
              <Input
                label={{ text: 'Client Name' }}
                name="clientName"
                required
              />
              <Input
                label={{ text: 'Description' }}
                name="description"
                required
              />
              <Input
                label={{ text: 'Amount ($)' }}
                name="amount"
                type="number"
                stepper={{ enabled: true, step: 0.01 }}
                required
              />
              <label>
                <Text element={{ size: 'sm' }}>Category</Text>
                <select
                  name="category"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--azimuth-spacing-xs)',
                    borderRadius: 'var(--azimuth-radius-sm)',
                    border: '1px solid var(--azimuth-color-border)',
                  }}
                >
                  <option value="">Select category...</option>
                  {Object.entries(revenueCategoryLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <Input
                label={{ text: 'Date' }}
                name="recordedAt"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
              <div className={styles.formActions}>
                <Button variant="primary" type="submit">
                  Create
                </Button>
                <a href="/admin/revenue">
                  <Button variant="tertiary" type="button">
                    Cancel
                  </Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      {activeTab === 'expenses' && showExpenseForm && (
        <Card>
          <form
            action={async (formData) => {
              const result = await createExpenseEntry(null, formData)
              if (result?.error) {
                alert(result.error)
              } else {
                router.push('/admin/revenue')
              }
            }}
          >
            <Stack spacing="sm">
              <Input label={{ text: 'Vendor' }} name="vendor" required />
              <Input
                label={{ text: 'Description' }}
                name="description"
                required
              />
              <Input
                label={{ text: 'Amount ($)' }}
                name="amount"
                type="number"
                stepper={{ enabled: true, step: 0.01 }}
                required
              />
              <label>
                <Text element={{ size: 'sm' }}>Category</Text>
                <select
                  name="category"
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--azimuth-spacing-xs)',
                    borderRadius: 'var(--azimuth-radius-sm)',
                    border: '1px solid var(--azimuth-color-border)',
                  }}
                >
                  <option value="">Select category...</option>
                  {Object.entries(expenseCategoryLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <Input
                label={{ text: 'Date' }}
                name="recordedAt"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
              <Input
                label={{ text: 'Receipt URL (optional)' }}
                name="receiptUrl"
                type="url"
              />
              <div className={styles.formActions}>
                <Button variant="primary" type="submit">
                  Create
                </Button>
                <a href="/admin/revenue">
                  <Button variant="tertiary" type="button">
                    Cancel
                  </Button>
                </a>
              </div>
            </Stack>
          </form>
        </Card>
      )}

      {activeTab === 'revenue' && (
        <Stack spacing="sm">
          {revenues.length === 0 ? (
            <EmptyState
              title="No Revenue Entries"
              description="Add your first revenue entry to get started."
            />
          ) : (
            <>
              <DataTable<RevenueEntry>
                data={{
                  columns: columns(revenues, 'revenue'),
                  data: revPageData,
                }}
                search={{ enabled: true, placeholder: 'Search revenue...' }}
              />
              {revTotalPages > 1 && (
                <div className={styles.formActions}>
                  {Array.from({ length: revTotalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={revPage === i + 1 ? 'primary' : 'tertiary'}
                      type="button"
                      onClick={() => setRevPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </Stack>
      )}

      {activeTab === 'expenses' && (
        <Stack spacing="sm">
          {expenses.length === 0 ? (
            <EmptyState
              title="No Expense Entries"
              description="Add your first expense entry to get started."
            />
          ) : (
            <>
              <DataTable<ExpenseEntry>
                data={{
                  columns: columns(expenses, 'expenses'),
                  data: expPageData,
                }}
                search={{ enabled: true, placeholder: 'Search expenses...' }}
              />
              {expTotalPages > 1 && (
                <div className={styles.formActions}>
                  {Array.from({ length: expTotalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={expPage === i + 1 ? 'primary' : 'tertiary'}
                      type="button"
                      onClick={() => setExpPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </Stack>
      )}
    </Stack>
  )
}
