'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, AlertTriangle, Check, X, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

type CoffeeCheck = {
  origin: string
  roastLevel: string
  required: number
  stock: number
  available: boolean
}

type OrderItem = { name: string; qty: number; kg: number }

type PackOrder = {
  orderId: string
  customer: string
  date: string
  totalKg: number
  items: OrderItem[]
  coffeeChecks: CoffeeCheck[]
  needsMoreRoast: boolean
  waitingCoffee: number
}

const MOCK_ORDERS: PackOrder[] = [
  {
    orderId: 'ORD-2026-0251',
    customer: 'โอเชี่ยนรีสอร์ท กรุ๊ป จำกัด',
    date: '2026-06-15',
    totalKg: 405.000,
    items: [
      { name: 'Splendente', qty: 305, kg: 305.000 },
      { name: 'Maverick', qty: 100, kg: 100.000 },
    ],
    coffeeChecks: [
      { origin: 'อราปิก้า เชียงใหม่', roastLevel: 'คั่วอ่อน', required: 61.000, stock: -35.900, available: false },
      { origin: 'โรบัสต้า ฉุนพร', roastLevel: 'คั่วเข้ม', required: 304.000, stock: -310.760, available: false },
      { origin: 'อราปิก้า เชียงใหม่', roastLevel: 'คั่วกลางค่อนเข้ม', required: 40.000, stock: 18.380, available: true },
    ],
    needsMoreRoast: true,
    waitingCoffee: 2,
  },
  {
    orderId: 'ORD-2026-0251',
    customer: 'กฤษกร แดงเลิศ',
    date: '2026-06-16',
    totalKg: 1.600,
    items: [
      { name: 'Brazil Santos 100% - คั่วกลาง', qty: 0.2, kg: 0.200 },
      { name: 'Ethiopia 100%', qty: 0.2, kg: 0.200 },
      { name: 'แคนดี้ป๊อป', qty: 0.2, kg: 0.200 },
      { name: 'ค่าส่ง', qty: 1, kg: 1.000 },
    ],
    coffeeChecks: [
      { origin: 'Brazil Santos', roastLevel: 'คั่วกลาง', required: 0.200, stock: 4.660, available: true },
      { origin: 'Ethiopia Guju G1', roastLevel: 'คั่วอ่อน', required: 0.200, stock: 10.360, available: true },
      { origin: 'Brazil Santos', roastLevel: 'คั่วอ่อนกลาง', required: 0.080, stock: -0.760, available: false },
      { origin: 'Columbia Huila Supremo Wash', roastLevel: 'คั่วอ่อนกลาง', required: 0.060, stock: 6.440, available: true },
      { origin: 'Guatemala Huehuetenango SHB Washed', roastLevel: 'คั่วอ่อน...', required: 0.060, stock: 6.440, available: true },
    ],
    needsMoreRoast: true,
    waitingCoffee: 1,
  },
]

export default function PackingPage() {
  const totalWaiting = MOCK_ORDERS.reduce((s, o) => s + o.waitingCoffee, 0)

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

      <div className="space-y-4">
        {MOCK_ORDERS.map((order, i) => (
          <div key={i} className={cn('rounded-xl border bg-card p-4 space-y-4', order.needsMoreRoast ? 'border-orange-200 bg-orange-50/30' : 'border-border')}>
            {/* Order header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                <span className="font-bold">{order.orderId}</span>
                <span className="text-muted-foreground">·</span>
                <span>{order.customer}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{order.date}</span>
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
                  {order.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">× {item.qty} kg = {item.kg.toFixed(3)} กก.</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: coffee availability */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">กาแฟที่ต้องใช้</p>
                <div className="space-y-1.5">
                  {order.coffeeChecks.map((cc, j) => (
                    <div key={j} className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-1.5 flex-1 min-w-0">
                        {cc.available ? (
                          <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className={cn('font-medium', cc.available ? 'text-foreground' : 'text-red-600')}>
                            {cc.origin}
                          </span>
                          <span className="ml-1 text-muted-foreground">{cc.roastLevel}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-muted-foreground">ต้องการ {cc.required.toFixed(3)} กก.</span>
                        {' '}
                        <span className={cn('font-medium', cc.available ? 'text-green-600' : 'text-red-500')}>
                          {cc.available ? `สต็อก: ${cc.stock.toFixed(3)} กก.` : `สต็อก: ${cc.stock.toFixed(3)} กก. — ขาด ${Math.abs(cc.stock).toFixed(3)} กก.`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-xs text-orange-600 font-medium">สต็อกกาแฟไม่เพียงพอ — แจ้งทีมคั่ว</span>
                <button className="text-xs text-primary hover:underline">ดูสต็อกกาแฟ</button>
                <button className="text-xs text-primary hover:underline flex items-center gap-0.5">คิวการคั่ว <ArrowRight className="h-3 w-3" /></button>
              </div>
              <Button size="sm" className="gap-1.5 text-xs">
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
