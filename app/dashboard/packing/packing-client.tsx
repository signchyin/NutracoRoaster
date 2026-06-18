'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertTriangle, Check, X, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateOrderStatus } from '@/app/actions/orders'
import type { RoastedInventory, Product } from '@/lib/db/schema'
import type { BlendIngredient } from '@/app/actions/products'

type OrderWithDetails = {
  id: string
  order_number: string
  customer: { name: string; type: string } | null
  order_date: string
  total_revenue: string
  status: string
  items: Array<{
    id: string
    product_id: string
    product_name_snapshot: string
    total_kg: string
    qty: string
    unit: string
  }>
}

type Props = {
  orders: OrderWithDetails[]
  roastedStock: RoastedInventory[]
  products: Product[]
}

export default function PackingClient({ orders, roastedStock, products }: Props) {
  const [pending, startTransition] = useTransition()

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  // Build coffee requirement checks for each order
  const packingOrders = orders.map((order) => {
    const totalKg = order.items.reduce((s, i) => s + Number(i.total_kg), 0)

    // For each item, get the blend recipe and compute required coffee by origin+roast_level
    const required: Record<string, { origin: string; roast_level: string; required_kg: number }> = {}
    for (const item of order.items) {
      const prod = productMap[item.product_id]
      if (!prod) continue
      const recipe = (prod.blend_recipe ?? []) as BlendIngredient[]
      const itemKg = Number(item.total_kg)
      if (recipe.length === 0) continue
      for (const ing of recipe) {
        const key = `${ing.origin}||${ing.roast_level}`
        if (!required[key]) {
          required[key] = { origin: ing.origin, roast_level: ing.roast_level, required_kg: 0 }
        }
        required[key].required_kg += (ing.percentage / 100) * itemKg
      }
    }

    const checks = Object.values(required).map((req) => {
      const stockRow = roastedStock.find(
        (r) => r.origin === req.origin && r.roast_level === req.roast_level,
      )
      const stock = stockRow ? Number(stockRow.stock_kg) : 0
      return {
        ...req,
        stock,
        available: stock >= req.required_kg,
      }
    })

    const waitingCoffee = checks.filter((c) => !c.available).length
    const needsMoreRoast = waitingCoffee > 0

    return { ...order, totalKg, checks, needsMoreRoast, waitingCoffee }
  })

  const totalWaiting = packingOrders.reduce((s, o) => s + o.waitingCoffee, 0)

  function markReady(id: string) {
    startTransition(() => updateOrderStatus(id, 'ready'))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight">ทีมแพ็คสินค้า</h1>
          <p className="text-sm text-muted-foreground">Packing Queue · รายการออเดอร์ที่รอบรรจุภัณฑ์</p>
        </div>
        {totalWaiting > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-3 py-1.5 text-sm font-medium text-orange-700">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            {totalWaiting} รอกาแฟ
          </div>
        )}
      </div>

      {packingOrders.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          ไม่มีออเดอร์ที่รอบรรจุ — ออเดอร์จะปรากฏที่นี่เมื่ออยู่ในสถานะ &quot;กำลังผลิต&quot;
        </div>
      )}

      <div className="space-y-4">
        {packingOrders.map((order) => (
          <div
            key={order.id}
            className={cn(
              'rounded-xl border bg-card p-4 space-y-4',
              order.needsMoreRoast ? 'border-orange-200 bg-orange-50/30' : 'border-border',
            )}
          >
            {/* Order header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                <span className="font-bold">{order.order_number}</span>
                <span className="text-muted-foreground">·</span>
                <span>{order.customer?.name ?? '—'}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{order.order_date}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{order.totalKg.toFixed(3)} กก. รวม</span>
              </div>
              {order.needsMoreRoast && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  ต้องการคั่วเพิ่ม
                </div>
              )}
            </div>

            {/* 2-col body */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left: order items */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">สินค้าในออเดอร์</p>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span>{item.product_name_snapshot}</span>
                      <span className="text-muted-foreground">
                        × {Number(item.qty)} {item.unit} = {Number(item.total_kg).toFixed(3)} กก.
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: coffee checks */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">กาแฟที่ต้องใช้</p>
                {order.checks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">ไม่มีข้อมูลส่วนผสม</p>
                ) : (
                  <div className="space-y-1.5">
                    {order.checks.map((cc, j) => (
                      <div key={j} className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          {cc.available ? (
                            <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className={cn('font-medium truncate', cc.available ? 'text-foreground' : 'text-red-600')}>
                              {cc.origin}
                            </span>
                            <span className="ml-1 text-muted-foreground">{cc.roast_level}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-muted-foreground">ต้องการ {cc.required_kg.toFixed(3)} กก.</span>
                          {' '}
                          <span className={cn('font-medium', cc.available ? 'text-green-600' : 'text-red-500')}>
                            {cc.available
                              ? `สต็อก: ${cc.stock.toFixed(3)} กก.`
                              : `ขาด ${(cc.required_kg - cc.stock).toFixed(3)} กก.`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <div className="flex items-center gap-3">
                {order.needsMoreRoast && (
                  <span className="text-xs text-orange-600 font-medium">สต็อกกาแฟไม่เพียงพอ</span>
                )}
                <a href="/dashboard/roast-done" className="text-xs text-primary hover:underline">ดูสต็อกกาแฟ</a>
                <a href="/dashboard/roast-queue" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                  คิวการคั่ว <ArrowRight className="h-3 w-3" />
                </a>
              </div>
              <Button
                size="sm"
                disabled={pending || order.needsMoreRoast}
                onClick={() => markReady(order.id)}
                className="gap-1.5 text-xs"
              >
                <Package className="h-3.5 w-3.5" />
                บรรจุเสร็จ
                <ArrowRight className="h-3.5 w-3.5" />
                พร้อมส่ง
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
