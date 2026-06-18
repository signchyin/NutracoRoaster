'use client'
// v2
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutList, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/db/schema'
import type { BlendIngredient } from '@/app/actions/products'

const BLEND_COLORS = ['#22c55e', '#f97316', '#ef4444', '#3b82f6', '#a855f7', '#eab308']

export default function ProductsClient({ products }: { products: Product[] }) {
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

      {products.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          ยังไม่มีสินค้า — กด &quot;เพิ่มสินค้า&quot; เพื่อเริ่มต้น
        </div>
      )}

      {/* Product list */}
      <div className="space-y-2">
        {products.map((p, idx) => {
          const recipe = (p.blend_recipe ?? []) as BlendIngredient[]
          const priceKg = Number(p.selling_price_per_kg)
          const costKg = Number(p.cost_per_kg)
          const margin = priceKg > 0 ? ((priceKg - costKg) / priceKg) * 100 : 0
          const stockKg = Number(p.roasted_stock_kg)
          const hasStock = stockKg > 0

          return (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 hover:bg-muted/20 transition-colors">
              {/* Thumbnail */}
              <div className="h-16 w-20 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
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
                  {recipe.length > 0 && (
                    <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-xs font-medium border border-purple-200">
                      Blend {recipe.length} ส่วน
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 mt-1">
                  {recipe.map((c, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: BLEND_COLORS[i % BLEND_COLORS.length] }} />
                      {c.origin} {c.percentage}%
                    </span>
                  ))}
                  {recipe.length === 0 && p.roast_level && (
                    <span className="text-xs text-muted-foreground">{p.roast_level}</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 shrink-0 text-right">
                <div>
                  <p className="text-xs text-muted-foreground">ราคาขาย/กก.</p>
                  <p className="font-semibold text-sm">฿{priceKg.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ต้นทุน/กก.</p>
                  <p className="font-semibold text-sm">฿{costKg.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Margin</p>
                  <p className={cn('font-semibold text-sm', margin > 30 ? 'text-green-600' : margin > 0 ? 'text-amber-600' : 'text-red-500')}>
                    {margin.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">สต็อก</p>
                  {hasStock ? (
                    <p className="text-sm font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {stockKg.toFixed(2)} กก.
                    </p>
                  ) : (
                    <p className="text-sm font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      หมด
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                  แก้ไข
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
