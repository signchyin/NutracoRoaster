'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutList, LayoutGrid, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

type BlendComponent = { origin: string; pct: number; color: string }
type Product = {
  id: string
  name: string
  blendCount: number
  components: BlendComponent[]
  pricePerKg: number
  costPerKg: number
  margin: number
  stockKg: number | null
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'B30L30R40', blendCount: 3, components: [{ origin: '(Arabica) Laos Bolaven 30%', pct: 30, color: '#22c55e' }, { origin: 'Brazil Santos 40%', pct: 40, color: '#f97316' }, { origin: 'โรบัสต้า ฉุนพร 30%', pct: 30, color: '#ef4444' }], pricePerKg: 550, costPerKg: 409, margin: 25.7, stockKg: null },
  { id: '2', name: 'Brazil Santos 100% - คั่วกลาง', blendCount: 1, components: [{ origin: 'Brazil Santos 100%', pct: 100, color: '#22c55e' }], pricePerKg: 600, costPerKg: 490, margin: 18.4, stockKg: 4.66 },
  { id: '3', name: 'Columbia 100% - คั่วอ่อน', blendCount: 1, components: [{ origin: 'Columbia Huila Supremo Wash 100%', pct: 100, color: '#22c55e' }], pricePerKg: 900, costPerKg: 551, margin: 38.8, stockKg: 6.44 },
  { id: '4', name: 'Ethiopia 100%', blendCount: 1, components: [{ origin: 'Ethiopia Guju G1 100%', pct: 100, color: '#22c55e' }], pricePerKg: 900, costPerKg: 570, margin: 36.6, stockKg: 10.36 },
  { id: '5', name: 'Ethiopia Blend', blendCount: 2, components: [{ origin: 'Ethiopia Guju G1 10%', pct: 10, color: '#22c55e' }, { origin: 'Brazil Santos 90%', pct: 90, color: '#f97316' }], pricePerKg: 675, costPerKg: 498, margin: 26.3, stockKg: null },
  { id: '6', name: 'Guatemala 100%', blendCount: 1, components: [{ origin: 'Guatemala Huehuetenango SHB Washed 100%', pct: 100, color: '#22c55e' }], pricePerKg: 900, costPerKg: 564, margin: 37.4, stockKg: 6.44 },
  { id: '7', name: 'L60R40', blendCount: 2, components: [{ origin: '(Arabica) Laos Bolaven 60%', pct: 60, color: '#22c55e' }, { origin: 'โรบัสต้า ฉุนพร 40%', pct: 40, color: '#ef4444' }], pricePerKg: 550, costPerKg: 365, margin: 33.6, stockKg: null },
  { id: '8', name: 'Laos 100% - คั่วอ่อน', blendCount: 1, components: [{ origin: '(Arabica) Laos Bolaven 100%', pct: 100, color: '#22c55e' }], pricePerKg: 550, costPerKg: 408, margin: 25.9, stockKg: 3.94 },
  { id: '9', name: 'Maverick', blendCount: 2, components: [{ origin: 'โรบัสต้า ฉุนพร 60%', pct: 60, color: '#ef4444' }, { origin: 'อราปิก้า เชียงใหม่ 40%', pct: 40, color: '#22c55e' }], pricePerKg: 445, costPerKg: 289, margin: 35.0, stockKg: null },
  { id: '10', name: 'Select', blendCount: 2, components: [{ origin: 'อราปิก้า เชียงใหม่ 70%', pct: 70, color: '#22c55e' }, { origin: 'โรบัสต้า ฉุนพร 30%', pct: 30, color: '#ef4444' }], pricePerKg: 225, costPerKg: 279, margin: -23.9, stockKg: null },
]

export default function ProductsPage() {
  const [view, setView] = useState<'list' | 'grid'>('list')

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight">สินค้า</h1>
          <p className="text-sm text-muted-foreground">กาแฟคั่วสำเร็จพร้อมขาย</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={cn('px-2.5 py-1.5 transition-colors', view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted')}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={cn('px-2.5 py-1.5 transition-colors', view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted')}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            เพิ่มสินค้า
          </Button>
        </div>
      </div>

      {/* Product list */}
      <div className="space-y-2">
        {MOCK_PRODUCTS.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 hover:bg-muted/20 transition-colors">
            {/* Thumbnail */}
            <div className="h-16 w-20 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden">
              {p.stockKg === null ? (
                <span className="text-xs text-muted-foreground font-medium">หมดสต็อก</span>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-300/60 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white/80" />
                </div>
              )}
            </div>

            {/* Name + blend */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{p.name}</span>
                <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-xs font-medium border border-purple-200">
                  Blend {p.blendCount}อัว
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 mt-1">
                {p.components.map((c, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: c.color }} />
                    {c.origin}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 shrink-0 text-right">
              <div>
                <p className="text-xs text-muted-foreground">ราคาขาย/กก.</p>
                <p className="font-semibold text-sm">฿{p.pricePerKg.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ต้นทุน/กก.</p>
                <p className="font-semibold text-sm">฿{p.costPerKg.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margin</p>
                <p className={cn('font-semibold text-sm', p.margin > 30 ? 'text-green-600' : p.margin > 0 ? 'text-amber-600' : 'text-red-500')}>
                  {p.margin.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">สต็อก</p>
                {p.stockKg === null ? (
                  <p className="text-sm font-medium flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    หมด
                  </p>
                ) : (
                  <p className="text-sm font-medium flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {p.stockKg.toFixed(2)} กก.
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                แก้ไข
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
