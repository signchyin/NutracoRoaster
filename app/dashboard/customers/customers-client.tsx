'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/db/schema'

const TYPE_FILTERS = ['ทุกประเภท', 'B2B', 'B2C']

export default function CustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ทุกประเภท')

  const filtered = customers.filter((c) => {
    const s = search.toLowerCase()
    const matchSearch =
      c.name.toLowerCase().includes(s) ||
      (c.name_en ?? '').toLowerCase().includes(s) ||
      (c.contact_person ?? '').toLowerCase().includes(s) ||
      (c.phone ?? '').includes(search)
    const matchType =
      typeFilter === 'ทุกประเภท' ||
      (typeFilter === 'B2B' && c.type === 'b2b') ||
      (typeFilter === 'B2C' && c.type === 'b2c')
    return matchSearch && matchType
  })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight">ลูกค้า</h1>
          <p className="text-sm text-muted-foreground">Customers</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          เพิ่มลูกค้าใหม่
        </Button>
      </div>

      {/* Search + filter row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อลูกค้า / ผู้ติดต่อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">ชื่อ</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">ประเภท</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">ผู้ติดต่อ / เบอร์โทร</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">เลขผู้เสียภาษี</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">วันที่เริ่มต้น</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {customers.length === 0
                    ? 'ยังไม่มีลูกค้า — กด "เพิ่มลูกค้าใหม่" เพื่อเริ่มต้น'
                    : 'ไม่พบลูกค้าที่ตรงกับการค้นหา'}
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-primary">{c.name}</p>
                  {c.name_en && <p className="text-xs text-muted-foreground">{c.name_en}</p>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      c.type === 'b2b' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700',
                    )}
                  >
                    {c.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <p>{c.contact_person ?? '—'}</p>
                  {c.phone && <p className="text-xs">{c.phone}</p>}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{c.tax_id ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.first_order_date ?? c.created_at.toString().slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-3">
                      แก้ไข
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
