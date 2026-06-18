'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteGreenBeanLot } from '@/app/actions/inventory'
import type { GreenBeanLot } from '@/lib/db/schema'

export default function InventoryClient({ lots }: { lots: GreenBeanLot[] }) {
  const [pending, startTransition] = useTransition()

  const totalKg = lots.reduce((s, l) => s + Number(l.stock_kg), 0)
  const totalValue = lots.reduce((s, l) => s + Number(l.stock_kg) * Number(l.cost_per_kg), 0)

  function handleDelete(id: string) {
    startTransition(() => deleteGreenBeanLot(id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight">สินค้าคงคลัง</h1>
          <p className="text-sm text-muted-foreground">Green Bean Inventory · LOT Tracking</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          รับสารกาแฟเข้า LOT
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">LOT ที่ใช้งานได้</p>
          <p className="text-3xl font-bold">{lots.length}</p>
          <p className="text-xs text-muted-foreground mt-1">จาก {lots.length} ทั้งหมด</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">น้ำหนักรวม</p>
          <p className="text-3xl font-bold">{totalKg.toLocaleString(undefined, { maximumFractionDigits: 2 })} กก.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">มูลค่าสต็อก</p>
          <p className="text-3xl font-bold">฿{Math.round(totalValue).toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs w-28">LOT ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">สารกาแฟ / แหล่งกำเนิด</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">ซัพพลายเออร์</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">วันรับ / Crop</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">คงเหลือ (กก.)</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">ต้นทุน/กก.</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs">มูลค่า</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">สถานะ</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {lots.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  ยังไม่มีสต็อก — กด &quot;รับสารกาแฟเข้า LOT&quot; เพื่อเริ่มต้น
                </td>
              </tr>
            )}
            {lots.map((lot) => {
              const stockKg = Number(lot.stock_kg)
              const costPerKg = Number(lot.cost_per_kg)
              const threshold = Number(lot.low_stock_threshold_kg)
              const isLow = stockKg > 0 && stockKg <= threshold
              const isOut = stockKg <= 0
              const value = stockKg * costPerKg

              return (
                <tr key={lot.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">{lot.lot_id ?? 'ไม่มี LOT ID'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{lot.bean_name}</p>
                    <p className="text-xs text-muted-foreground">{lot.origin_country}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs">{lot.supplier_name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">
                      {[lot.supplier_contact, lot.supplier_phone].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-center">
                    {lot.receiving_date ?? '—'}
                    {lot.crop_year && <p className="text-xs">{lot.crop_year}</p>}
                  </td>
                  <td className={cn('px-4 py-3 text-right font-medium', isLow ? 'text-orange-500' : isOut ? 'text-red-500' : '')}>
                    {stockKg.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">฿{costPerKg.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">฿{Math.round(value).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {!isOut && (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 w-fit">
                          พร้อมใช้
                        </span>
                      )}
                      {isLow && (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-600 w-fit">
                          สต็อกต่ำ
                        </span>
                      )}
                      {isOut && (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 w-fit">
                          หมดสต็อก
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">แก้ไข</Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">ปรับสต็อก</Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={pending}
                        onClick={() => handleDelete(lot.id)}
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
