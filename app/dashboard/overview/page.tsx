'use client'

import { useState } from 'react'
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

const KPI_TABS = ['เดือนนี้', '3 เดือน', '12 เดือน', 'ทั้งหมด', 'กำหนดเอง']

const revenueData = [
  { month: 'ม.ค.', revenue: 80000, cost: 60000 },
  { month: 'ก.พ.', revenue: 95000, cost: 70000 },
  { month: 'มี.ค.', revenue: 110000, cost: 82000 },
  { month: 'เม.ย.', revenue: 130000, cost: 95000 },
  { month: 'พ.ค.', revenue: 175000, cost: 120000 },
  { month: 'มิ.ย.', revenue: 200820, cost: 180444 },
]

const b2bData = [
  { name: 'B2B', revenue: 195000, margin: 90.8 },
  { name: 'B2C', revenue: 5820, margin: 25.3 },
]

const marginByProduct = [
  { name: 'Splendente', margin: 100 },
  { name: 'Maverick', margin: 95 },
  { name: 'มัก-คัน', margin: 67 },
  { name: 'แคนดี้ป๊อป', margin: 60 },
  { name: 'Ethiopia 100%', margin: 57 },
  { name: 'B30L30R40', margin: 55 },
  { name: 'ค่าส่ง', margin: 46 },
  { name: 'L60R40', margin: 43 },
]

const zoneData = [{ name: 'ภาคใต้', value: 100 }]

const topProducts = [
  { name: 'Splendente', revenue: 125050, margin: '100.0%' },
  { name: 'Maverick', revenue: 48750, margin: '93.5%' },
  { name: 'มัก-คัน', revenue: 9000, margin: '65.5%' },
]

const topCustomers = [
  { name: 'โอเชี่ยนรีสอร์ท กรุ๊ป จำกัด', revenue: 169550, orders: 1 },
  { name: 'Lancake', revenue: 17950, orders: 6 },
  { name: 'youngyu.hdy', revenue: 6100, orders: 1 },
]

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState('เดือนนี้')

  const kpis = [
    { label: 'รายได้', value: '฿200,820', sub: '▲ 0.0%', subColor: 'text-green-600' },
    { label: 'กำไรขั้นต้น', value: '฿180,444', sub: 'Margin 89.9%', subColor: 'text-muted-foreground' },
    { label: 'จำนวนออเดอร์', value: '12', sub: 'รายการ', subColor: 'text-muted-foreground' },
    { label: 'น้ำหนักคั่ว', value: '464.0 กก.', sub: 'รวมทุกรอบ', subColor: 'text-muted-foreground' },
    { label: 'กำไร / กก.', value: '฿389', sub: '', subColor: '' },
  ]

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
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white shadow-sm text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className="text-2xl font-bold">{k.value}</p>
            {k.sub && <p className={`text-xs mt-1 ${k.subColor}`}>{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm">รายได้ & ต้นทุน (6 เดือน)</p>
          <p className="text-xs text-muted-foreground mb-3">Revenue vs Cost</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => `฿${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} name="รายได้" />
              <Bar dataKey="cost" fill="#86efac" radius={[3, 3, 0, 0]} name="ต้นทุน" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm">B2B vs B2C</p>
          <p className="text-xs text-muted-foreground mb-3">ยอดขาย & Gross Margin %</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={b2bData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v: number) => typeof v === 'number' ? (v > 100 ? `฿${v.toLocaleString()}` : `${v}%`) : v} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} name="ยอดขาย (฿)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm">Gross Margin % แยกสินค้า</p>
          <p className="text-xs text-muted-foreground mb-3">{'เขียว ≥30% · เหลือง ≥10% · แดง <10%'}</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={marginByProduct} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, 110]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="margin" radius={[0, 3, 3, 0]}>
                {marginByProduct.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.margin >= 30 ? '#22c55e' : entry.margin >= 10 ? '#f59e0b' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-semibold text-sm">สัดส่วนยอดขายตามภูมิภาค</p>
          <p className="text-xs text-muted-foreground mb-3">Zone distribution</p>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={zoneData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill="#3b82f6" />
              </Pie>
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(v) => <span className="text-xs">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
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
                <th className="pb-2 text-right font-medium">MARGIN</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.name} className="border-b border-border/50 last:border-0">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-right">฿{p.revenue.toLocaleString()}</td>
                  <td className="py-2 text-right text-green-600 font-medium">{p.margin}</td>
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
                <th className="pb-2 text-right font-medium">ออเดอร์</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c) => (
                <tr key={c.name} className="border-b border-border/50 last:border-0">
                  <td className="py-2 text-sm truncate max-w-[180px]">{c.name}</td>
                  <td className="py-2 text-right">฿{c.revenue.toLocaleString()}</td>
                  <td className="py-2 text-right">{c.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
