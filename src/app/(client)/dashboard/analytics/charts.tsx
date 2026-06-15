'use client'

import type { PieLabelRenderProps } from 'recharts'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, Stack, Text } from 'azimuth-ui'

const COLORS = ['#4338ca', '#059669', '#d97706', '#dc2626', '#6b7280']

interface BarChartCardProps {
  title: string
  data: { label: string; value: number }[]
  dataKey?: string
  color?: string
}

export function BarChartCard({
  title,
  data,
  dataKey = 'value',
  color = '#4338ca',
}: BarChartCardProps) {
  return (
    <Card>
      <Stack spacing="sm">
        <Text weight="semibold">{title}</Text>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--azimuth-color-border, #e5e7eb)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke="var(--azimuth-color-secondary, #6b7280)"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="var(--azimuth-color-secondary, #6b7280)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--azimuth-color-bg, #fff)',
                border: '1px solid var(--azimuth-color-border, #e5e7eb)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Stack>
    </Card>
  )
}

interface PieChartCardProps {
  title: string
  data: { name: string; value: number }[]
}

export function PieChartCard({ title, data }: PieChartCardProps) {
  return (
    <Card>
      <Stack spacing="sm">
        <Text weight="semibold">{title}</Text>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }: PieLabelRenderProps) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--azimuth-color-bg, #fff)',
                border: '1px solid var(--azimuth-color-border, #e5e7eb)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Stack>
    </Card>
  )
}
