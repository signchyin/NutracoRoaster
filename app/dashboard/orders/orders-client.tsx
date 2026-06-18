'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cancelOrder } from '@/app/actions/orders'
import type { Order, Customer } from '@/lib/db/schema'

type OrderWithCustomer = Order & {
  customer: { name: string; type: string } | null
  items: unknown[]
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'แบบร่าง',
  confirmed: 'ยืนยันแล้ว',
  in_production: 'กำลังผลิต',
  ready: 'พร้อมส่ง',
  shipped: 'จัดส่งแล้ว',
  completed: 'เสร็จสมบูรณ์',
  cancelled: 'ยกเลิก',
}

const STATUS_STYLE: Record<string, string> = {
  in_production: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  ready: 'bg-blue-100 text-blue-700',
  shipped: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-gray-100 text-gray-600',
  draft: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
}

export default function OrdersClient({ orders }: { orders: OrderWithCustomer[] }) {
  const [search, setSearch] = useState('')
  const [pending, startTransition] = useTransition()

  const filtered = orders.filter((o) => {
    const s = search.toLowerCase()
    return (
      o.order_number.toLowerCase().includes(s) ||
      (o.customer?.name ?? '').toLowerCase().includes(s)
    )
  })

  function handleCancel(id: string) {
    startTransition(() => {
      cancelOrder(id)
    })
  }

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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  ยังไม่มีออเดอร์ — กด &quot;สร้างออเดอร์ใหม่&quot; เพื่อเริ่มต้น
                </td>
              </tr>
            )}
            {filtered.map((order) => {
              const marginPct = Number(order.profit_margin_pct) * 100
              const profitNum = Number(order.profit)
              const revenueNum = Number(order.total_revenue)
              const canCancel = order.status === 'in_production' || order.status === 'confirmed'

              return (
                <tr
                  key={order.id}
                  className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-primary">{order.order_number}</td>
                  <td className="px-4 py-3">{order.customer?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.order_date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.billing_period}</td>
                  <td className="px-4 py-3 text-right">฿{revenueNum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                  <td className={cn('px-4 py-3 text-right font-medium', profitNum > 50000 ? 'text-blue-600' : '')}>
                    ฿{profitNum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {marginPct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-600')}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canCancel && (
                      <button
                        disabled={pending}
                        onClick={() => handleCancel(order.id)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
