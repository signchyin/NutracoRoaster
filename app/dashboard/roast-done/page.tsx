'use client'

import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

type RoastedItem = {
  origin: string
  roastLevel: string
  stockKg: number
  lowStock?: boolean
  outOfStock?: boolean
}

const MOCK_ROASTED: RoastedItem[] = [
  { origin: '(Arabica) Laos Bolaven', roastLevel: 'คั่วอ่อน', stockKg: 3.940, lowStock: true },
  { origin: '(Arabica) Laos Bolaven', roastLevel: 'คั่วเข้ม', stockKg: 6.560 },
  { origin: 'Brazil Cerrado', roastLevel: 'คั่วกลาง', stockKg: 0, outOfStock: true },
  { origin: 'Brazil Santos', roastLevel: 'คั่วกลาง', stockKg: 4.660, lowStock: true },
  { origin: 'Brazil Santos', roastLevel: 'คั่วอ่อนกลาง', stockKg: 0, outOfStock: true },
  { origin: 'Columbia Huila Supremo Wash', roastLevel: 'คั่วอ่อนกลาง', stockKg: 6.440 },
  { origin: 'Ethiopia Guju G1', roastLevel: 'คั่วอ่อน', stockKg: 10.360 },
  { origin: 'Guatemala Huehuetenango SHB Washed', roastLevel: 'คั่วอ่อนกลาง', stockKg: 6.440 },
  { origin: 'อราปิก้า เชียงใหม่', roastLevel: 'คั่วกลางค่อนเข้ม', stockKg: 18.380 },
  { origin: 'อราปิก้า เชียงใหม่', roastLevel: 'คั่วอ่อน', stockKg: 0, outOfStock: true },
  { origin: 'อราปิก้า เชียงใหม่', roastLevel: 'คั่วเข้ม', stockKg: 0.140, lowStock: true },
  { origin: 'โรบัสต้า ฉุนพร', roastLevel: 'คั่วกลางค่อนเข้ม', stockKg: 86.550 },
  { origin: 'โรบัสต้า ฉุนพร', roastLevel: 'คั่วเข้ม', stockKg: 0, outOfStock: true },
]

const roastLevelColor: Record<string, string> = {
  'คั่วอ่อน': 'bg-amber-50 text-amber-700 border border-amber-200',
  'คั่วกลาง': 'bg-orange-50 text-orange-700 border border-orange-200',
  'คั่วเข้ม': 'bg-red-50 text-red-700 border border-red-200',
  'คั่วอ่อนกลาง': 'bg-lime-50 text-lime-700 border border-lime-200',
  'คั่วกลางค่อนเข้ม': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
}

const totalItems = MOCK_ROASTED.length
const inStockItems = MOCK_ROASTED.filter((i) => i.stockKg > 0).length
const uniqueOrigins = new Set(MOCK_ROASTED.map((i) => i.origin)).size
const totalKg = MOCK_ROASTED.reduce((sum, i) => sum + i.stockKg, 0)

export default function RoastDonePage() {
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
          <p className="text-xs text-muted-foreground mt-1">จาก {totalItems} รายการ</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">แหล่งกำเนิดกี่หมด</p>
          <p className="text-3xl font-bold">{uniqueOrigins}</p>
          <p className="text-xs text-muted-foreground mt-1">ต้นกำเนิดกาแฟ</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">น้ำหนักรวม</p>
          <p className="text-3xl font-bold text-red-500">{totalKg.toFixed(2)} กก.</p>
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
            {MOCK_ROASTED.map((item, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">{item.origin}</td>
                <td className="px-4 py-3">
                  <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', roastLevelColor[item.roastLevel] ?? 'bg-gray-100 text-gray-700')}>
                    {item.roastLevel}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {item.outOfStock ? (
                    <span className="text-muted-foreground">หมด</span>
                  ) : (
                    <span className={cn('font-medium', item.lowStock ? 'text-orange-500' : '')}>
                      {item.stockKg.toFixed(3)}
                    </span>
                  )}
                  {item.lowStock && (
                    <span className="ml-2 text-xs text-orange-500 font-medium">ใกล้หมด</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1">
                    ปรับ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
