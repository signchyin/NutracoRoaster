'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Order = {
  id: string
  customer: string
  date: string
  cycle: string
  revenue: number
  profit: number
  margin: string
  status: 'กำลังผลิต' | 'เสร็จสมบูรณ์'
  canCancel?: boolean
}

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-2026-0251', customer: 'กฤษกร แดงเลิศ', date: '2026-06-16', cycle: '2026-06', revenue: 810, profit: 432, margin: '53.3%', status: 'กำลังผลิต', canCancel: true },
  { id: 'ORD-2026-0241', customer: 'Lancake', date: '2026-06-15', cycle: '2026-06', revenue: 5200, profit: 1857, margin: '35.7%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0251', customer: 'โอเชี่ยนรีสอร์ท กรุ๊ป จำกัด', date: '2026-06-15', cycle: '2026-06', revenue: 169550, profit: 169550, margin: '100.0%', status: 'กำลังผลิต', canCancel: true },
  { id: 'ORD-2026-0211', customer: 'Kran Chong', date: '2026-06-11', cycle: '2026-06', revenue: 1310, profit: 544, margin: '41.5%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0201', customer: 'Lancake', date: '2026-06-11', cycle: '2026-06', revenue: 3200, profit: 977, margin: '30.6%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0221', customer: 'ฉุดิ', date: '2026-06-08', cycle: '2026-06', revenue: 2350, profit: 440, margin: '18.7%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0191', customer: 'Lancake', date: '2026-06-08', cycle: '2026-06', revenue: 2600, profit: 929, margin: '35.7%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0171', customer: 'Kran Chong', date: '2026-06-02', cycle: '2026-06', revenue: 1650, profit: 651, margin: '39.5%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0181', customer: 'Lancake', date: '2026-06-02', cycle: '2026-06', revenue: 3200, profit: 977, margin: '30.6%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0161', customer: 'youngyu.hdy', date: '2026-05-31', cycle: '2026-06', revenue: 6100, profit: 2030, margin: '33.3%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0151', customer: 'Lancake', date: '2026-05-29', cycle: '2026-06', revenue: 3200, profit: 1405, margin: '43.9%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0141', customer: 'Kran Chong', date: '2026-05-26', cycle: '2026-06', revenue: 1650, profit: 651, margin: '39.5%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0131', customer: 'Lancake', date: '2026-05-25', cycle: '2026-05', revenue: 3200, profit: 1405, margin: '43.9%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0121', customer: 'Lancake', date: '2026-05-20', cycle: '2026-05', revenue: 2600, profit: 929, margin: '35.7%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0111', customer: 'บริษัทฎติณ จำกัด', date: '2026-05-18', cycle: '2026-05', revenue: 2600, profit: 2266, margin: '87.1%', status: 'เสร็จสมบูรณ์' },
  { id: 'ORD-2026-0101', customer: 'Lancake', date: '2026-05-18', cycle: '2026-05', revenue: 600, profit: 476, margin: '79.4%', status: 'เสร็จสมบูรณ์' },
]

export default function OrdersPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_ORDERS.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight">รายการสั่งซื้อ</h1>
          <p className="text-sm text-muted-foreground">Orders</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          สร้างออเดอร์ใหม่
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Table header */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">เลขที่ออเดอร์</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">ลูกค้า</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">วันที่</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">รอบบิล</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">รายได้รวม</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">กำไร</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">MARGIN</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">สถานะ</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">{order.id}</td>
                <td className="px-4 py-3">{order.customer}</td>
                <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                <td className="px-4 py-3 text-muted-foreground">{order.cycle}</td>
                <td className="px-4 py-3 text-right">฿{order.revenue.toLocaleString()}</td>
                <td className={cn('px-4 py-3 text-right font-medium', order.profit > 50000 ? 'text-blue-600' : '')}>
                  ฿{order.profit.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{order.margin}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      order.status === 'กำลังผลิต'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700',
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {order.canCancel && (
                    <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                      ยกเลิก
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
