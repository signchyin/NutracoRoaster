'use client'

import { useState, useTransition } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ComposedChart, Line,
} from 'recharts'
import { getDashboardOverview } from '@/app/actions/dashboard'
import type { DashboardPeriod } from '@/app/actions/dashboard'

type OverviewData = Awaited<ReturnType<typeof getDashboardOverview>>

const KPI_TABS: { label: string; period: DashboardPeriod }[] = [
  { label: 'เดือนนี้', period: 'month' },
  { label: '3 เดือน', period: 'quarter' },
  { label: '12 เดือน', period: 'year' },
  { label: 'ทั้งหมด', period: 'all' },
]

const ZONE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function OverviewClient({
  initialData,
  initialPeriod,
}: {
  initialData: OverviewData
  initialPeriod: DashboardPeriod
}) {
  const [data, setData] = useState(initialData)
  const [activePeriod, setActivePeriod] = useState<DashboardPeriod>(initialPeriod)
  const [pending, startTransition] = useTransition()

  function switchPeriod(period: DashboardPeriod) {
    setActivePeriod(period)
    startTransition(async () => {
      const fresh = await getDashboardOverview(period)
      setData(fresh)
    })
  }

  const { kpi, monthly, channelSplit, zones, topProducts, topCustomers } = data

  const marginByProduct = topProducts.map((p) => ({
    name: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name,
    margin: p.total_revenue > 0 ? 0 : 0, // placeholder until we have per-product margin
    revenue: p.total_revenue,
  }))

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold leading-tight">ภาพรวมธุรกิจ</h1>
        <p className="text-sm text-muted-foreground">Business Overview</p>
      </div>

      {/* Time filter tabs */}
      <div className="flex gap-1">
        {KPI_TABS.map((tab) => (
          <button
            key={tab.period}
            onClick={() => switchPeriod(tab.period)}
            disabled={pending}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 ${
              activePeriod === tab.period
                ? 'bg-white shadow-sm text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'รายได้', value: `฿${kpi.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: 'กำไรขั้นต้น', value: `฿${kpi.total_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: `Margin ${kpi.gross_margin_pct.toFixed(1)}%` },
          { label: 'จำนวนออเดอร์', value: String(kpi.order_count), sub: 'รายการ' },
          { label: 'ต้นทุนรวม', value: `฿${kpi.total_cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: 'กำไร / รายได้', value: `${kpi.gross_margin_pct.toFixed(1)}%` },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className="text-2xl font-bold">{k.value}</p>
            {k.sub && <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm">รายได้ & ต้นทุน (รายเดือน)</p>
          <p className="text-xs text-muted-foreground mb-3">Revenue vs Cost</p>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={monthly} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} name="รายได้" />
              <Bar dataKey="cost" fill="#86efac" radius={[3, 3, 0, 0]} name="ต้นทุน" />
              <Line dataKey="margin_pct" yAxisId="right" stroke="#f59e0b" dot={false} name="Margin %" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm">B2B vs B2C</p>
          <p className="text-xs text-muted-foreground mb-3">ยอดขาย & Gross Margin %</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={channelSplit}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} tickFormatter={(v) => v.toUpperCase()} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} name="ยอดขาย (฿)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm">สินค้าขายดีสูงสุด (Top 5)</p>
          <p className="text-xs text-muted-foreground mb-3">{'เรียงตามรายได้'}</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110}
                tickFormatter={(v) => v.length > 16 ? v.slice(0, 16) + '…' : v}
              />
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
              <Bar dataKey="total_revenue" radius={[0, 3, 3, 0]} fill="#3b82f6" name="รายได้" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm">สัดส่วนยอดขายตามภูมิภาค</p>
          <p className="text-xs text-muted-foreground mb-3">Zone distribution</p>
          {zones.length === 0 ? (
            <div className="flex items-center justify-center h-[230px] text-sm text-muted-foreground">ไม่มีข้อมูลโซน</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={zones}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="revenue"
                  nameKey="zone"
                >
                  {zones.map((_, i) => (
                    <Cell key={i} fill={ZONE_COLORS[i % ZONE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs">{v}</span>} />
                <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm mb-3">สินค้าขายดี</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">สินค้า</th>
                <th className="pb-2 text-right font-medium">รายได้</th>
                <th className="pb-2 text-right font-medium">น้ำหนัก (กก.)</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan={3} className="py-4 text-center text-xs text-muted-foreground">ยังไม่มีข้อมูล</td></tr>
              ) : topProducts.map((p) => (
                <tr key={p.name} className="border-b border-border/50 last:border-0">
                  <td className="py-2 truncate max-w-[140px]">{p.name}</td>
                  <td className="py-2 text-right">฿{p.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="py-2 text-right text-muted-foreground">{p.total_kg.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm mb-3">ลูกค้าสำคัญ</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">ลูกค้า</th>
                <th className="pb-2 text-right font-medium">รายได้รวม</th>
                <th className="pb-2 text-right font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length === 0 ? (
                <tr><td colSpan={3} className="py-4 text-center text-xs text-muted-foreground">ยังไม่มีข้อมูล</td></tr>
              ) : topCustomers.map((c) => (
                <tr key={c.name} className="border-b border-border/50 last:border-0">
                  <td className="py-2 text-sm truncate max-w-[160px]">{c.name}</td>
                  <td className="py-2 text-right">฿{c.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className={`py-2 text-right font-medium ${c.margin_pct > 30 ? 'text-green-600' : c.margin_pct > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                    {c.margin_pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
