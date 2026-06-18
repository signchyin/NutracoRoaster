'use client'

import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type LotItem = {
  lotId: string
  coffee: string
  origin: string
  supplier: string
  supplierPhone: string
  receivedDate: string
  stockKg: number
  costPerKg: number
  totalValue: number
  status: 'พร้อมใช้' | 'สต็อกต่ำ'
  lowStock?: boolean
}

const MOCK_LOTS: LotItem[] = [
  { lotId: 'ไม่มี LOT ID', coffee: 'Guatemala Huehuetenango SHB Washed', origin: 'Guatemala', supplier: 'บริษัท คอฟฟี่บีน เอสแอนด์เอส จำกัด (สำนักงานใหญ่)', supplierPhone: 'สุรีรัตน์ · 0813184759', receivedDate: '—', stockKg: 21.28, costPerKg: 395.00, totalValue: 8406, status: 'พร้อมใช้', lowStock: true },
  { lotId: 'ไม่มี LOT ID', coffee: 'Columbia Huila Supremo Wash', origin: 'Columbia', supplier: 'บริษัท คอฟฟี่บีน เอสแอนด์เอส จำกัด (สำนักงานใหญ่)', supplierPhone: 'สุรีรัตน์ · 0813184759', receivedDate: '—', stockKg: 48.00, costPerKg: 375.00, totalValue: 18000, status: 'พร้อมใช้' },
  { lotId: 'ไม่มี LOT ID', coffee: 'Ethiopia Guju G1', origin: 'Ethiopia', supplier: 'บริษัท คอฟฟี่บีน เอสแอนด์เอส จำกัด (สำนักงานใหญ่)', supplierPhone: 'สุรีรัตน์ · 0813184759', receivedDate: '—', stockKg: 21.00, costPerKg: 475.00, totalValue: 9975, status: 'พร้อมใช้', lowStock: true },
  { lotId: 'ไม่มี LOT ID', coffee: '(Arabica) Laos Bolaven', origin: 'Laos', supplier: 'บริษัท คอฟฟี่บีน เอสแอนด์เอส จำกัด (สำนักงานใหญ่)', supplierPhone: 'สุรีรัตน์ · 0813184759', receivedDate: '—', stockKg: 22.00, costPerKg: 285.00, totalValue: 6270, status: 'พร้อมใช้', lowStock: true },
  { lotId: 'ไม่มี LOT ID', coffee: 'Brazil Cerrado', origin: 'Brazil', supplier: 'บริษัท คอฟฟี่บีน เอสแอนด์เอส จำกัด (สำนักงานใหญ่)', supplierPhone: 'สุรีรัตน์ · 0813184759', receivedDate: '—', stockKg: 90.00, costPerKg: 345.00, totalValue: 31050, status: 'พร้อมใช้' },
  { lotId: 'ไม่มี LOT ID', coffee: 'Brazil Santos', origin: 'Brazil', supplier: 'บริษัท คอฟฟี่บีน เอสแอนด์เอส จำกัด (สำนักงานใหญ่)', supplierPhone: 'สุรีรัตน์ · 0813184759', receivedDate: '—', stockKg: 27.72, costPerKg: 340.00, totalValue: 9425, status: 'พร้อมใช้', lowStock: true },
  { lotId: 'ไม่มี LOT ID', coffee: 'อราปิก้า เชียงใหม่', origin: 'เชียงใหม่', supplier: 'อีเอซ คอเอจ', supplierPhone: 'คุณโม · 091-8545427', receivedDate: '—', stockKg: 1888.00, costPerKg: 120.00, totalValue: 226560, status: 'พร้อมใช้' },
  { lotId: 'ไม่มี LOT ID', coffee: 'โรบัสต้า ฉุนพร', origin: 'โกย-ฉุนพร', supplier: 'บริษัท วังกอง คอฟฟี่ จำกัด', supplierPhone: 'คุณอลอง · 080-3699597', receivedDate: '—', stockKg: 19868.00, costPerKg: 155.00, totalValue: 3079540, status: 'พร้อมใช้' },
]

const totalLots = MOCK_LOTS.length
const totalKg = MOCK_LOTS.reduce((s, l) => s + l.stockKg, 0)
const totalValue = MOCK_LOTS.reduce((s, l) => s + l.totalValue, 0)

export default function InventoryPage() {
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
          <p className="text-3xl font-bold">{totalLots}</p>
          <p className="text-xs text-muted-foreground mt-1">จาก {totalLots} ทั้งหมด</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">น้ำหนักรวม</p>
          <p className="text-3xl font-bold">{totalKg.toLocaleString()} กก.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">มูลค่าสต็อก</p>
          <p className="text-3xl font-bold">฿{totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs w-24">LOT ID</th>
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
            {MOCK_LOTS.map((lot, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">{lot.lotId}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{lot.coffee}</p>
                  <p className="text-xs text-muted-foreground">{lot.origin}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs">{lot.supplier}</p>
                  <p className="text-xs text-muted-foreground">{lot.supplierPhone}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-center">—</td>
                <td className={cn('px-4 py-3 text-right font-medium', lot.lowStock ? 'text-orange-500' : '')}>
                  {lot.stockKg.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">฿{lot.costPerKg.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">฿{lot.totalValue.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 w-fit">
                      พร้อมใช้
                    </span>
                    {lot.lowStock && (
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 w-fit">
                        สต็อกต่ำ
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">แก้ไข</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">ปรับสต็อก</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
