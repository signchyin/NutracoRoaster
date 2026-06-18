'use client'

import { cn } from '@/lib/utils'
import type { RoastedInventory } from '@/lib/db/schema'

const ROAST_LEVEL_COLOR: Record<string, string> = {
  'คั่วอ่อน': 'bg-amber-50 text-amber-700 border border-amber-200',
  'คั่วกลาง': 'bg-orange-50 text-orange-700 border border-orange-200',
  'คั่วเข้ม': 'bg-red-50 text-red-700 border border-red-200',
  'คั่วอ่อนกลาง': 'bg-lime-50 text-lime-700 border border-lime-200',
  'คั่วกลางค่อนเข้ม': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'คั่วกลางอ่อนเข้ม': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
}

const LOW_STOCK_THRESHOLD = 5 // kg

export default function RoastDoneClient({ items }: { items: RoastedInventory[] }) {
  const inStockItems = items.filter((i) => Number(i.stock_kg) > 0).length
  const uniqueOrigins = new Set(items.map((i) => i.origin)).size
  const totalKg = items.reduce((sum, i) => sum + Number(i.stock_kg), 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold leading-tight">กาแฟคั่วสำเร็จ</h1>
        <p className="text-sm text-muted-foreground">
          Roasted Coffee Inventory · ติดตามสต็อกตามแหล่งกำเนิด × ระดับการคั่ว
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">รายการที่มีสต็อก</p>
          <p className="text-3xl font-bold">{inStockItems}</p>
          <p className="text-xs text-muted-foreground mt-1">จาก {items.length} รายการ</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">แหล่งกำเนิดทั้งหมด</p>
          <p className="text-3xl font-bold">{uniqueOrigins}</p>
          <p className="text-xs text-muted-foreground mt-1">ต้นกำเนิดกาแฟ</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">น้ำหนักรวม</p>
          <p className={cn('text-3xl font-bold', totalKg < 0 ? 'text-red-500' : '')}>
            {totalKg.toFixed(2)} กก.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">แหล่งกำเนิด (Origin)</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">ระดับการคั่ว</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">คงเหลือ (กก.)</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  ยังไม่มีสต็อกกาแฟคั่ว — สต็อกจะอัปเดตอัตโนมัติเมื่อ Batch คั่วเสร็จ
                </td>
              </tr>
            )}
            {items.map((item) => {
              const stockKg = Number(item.stock_kg)
              const isLow = stockKg > 0 && stockKg <= LOW_STOCK_THRESHOLD
              const isOut = stockKg <= 0
              const isNegative = stockKg < 0

              return (
                <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">{item.origin}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', ROAST_LEVEL_COLOR[item.roast_level] ?? 'bg-gray-100 text-gray-700')}>
                      {item.roast_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isOut && !isNegative ? (
                      <span className="text-muted-foreground">หมด</span>
                    ) : (
                      <span className={cn('font-medium', isNegative ? 'text-red-500' : isLow ? 'text-orange-500' : '')}>
                        {stockKg.toFixed(3)}
                      </span>
                    )}
                    {isLow && !isNegative && (
                      <span className="ml-2 text-xs text-orange-500 font-medium">ใกล้หมด</span>
                    )}
                    {isNegative && (
                      <span className="ml-2 text-xs text-red-500 font-medium">ขาด {Math.abs(stockKg).toFixed(3)} กก.</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1">
                      ปรับ
                    </button>
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
