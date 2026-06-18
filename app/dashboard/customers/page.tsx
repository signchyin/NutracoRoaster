'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Customer = {
  id: string
  name: string
  nameEn?: string
  type: 'B2B' | 'B2C'
  contact: string
  phone: string
  taxId?: string
  startDate: string
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Kran Chong', type: 'B2B', contact: 'ธนัญภรณ์ ด่านสกุล', phone: '0910433366', taxId: '1849901416192', startDate: '2026-04-30' },
  { id: '2', name: 'Lancake', type: 'B2B', contact: 'จิตอยา กะตากุล', phone: '0989165451', taxId: '1000400263565', startDate: '2026-05-01' },
  { id: '3', name: 'youngyu.hdy', nameEn: 'youngyu.hdy', type: 'B2B', contact: 'กีรติ สกุลอง', phone: '0918460865', taxId: '1909082237795', startDate: '2026-04-24' },
  { id: '4', name: 'กฤษกร แดงเลิศ', type: 'B2C', contact: 'กฤษกร แดงเลิศ', phone: '0969946356', taxId: undefined, startDate: '2026-06-16' },
  { id: '5', name: 'จีรัชญา จงรักษ์', type: 'B2C', contact: 'จีรัชญา จงรักษ์', phone: '0862743888', taxId: undefined, startDate: '—' },
  { id: '6', name: 'ฉุดิ', type: 'B2C', contact: 'ฉุดิบา จิรัตนปฏิกุล', phone: '', taxId: undefined, startDate: '2026-06-08' },
  { id: '7', name: 'บริษัทฎตูลิณ จำกัด', type: 'B2B', contact: '—', phone: '0878885654', taxId: '0085562000841', startDate: '2026-05-18' },
  { id: '8', name: 'พระตันบูรณ์ ผลธนโม ปลอดทอง', type: 'B2C', contact: 'พระ โค้ช', phone: '0862743888', taxId: undefined, startDate: '2026-05-17' },
  { id: '9', name: 'โอเชี่ยนรีสอร์ท กรุ๊ป จำกัด', nameEn: 'ocean resort group', type: 'B2B', contact: 'คุณ มาตาซา', phone: '0822065456', taxId: '0833546007179', startDate: '2026-06-15' },
  { id: '10', name: 'ไตรศักดิ์ ไตรเลมี่', type: 'B2C', contact: 'มาร์ค', phone: '080157716', taxId: undefined, startDate: '2026-04-30' },
]

const TYPE_FILTERS = ['ทุกประเภท', 'B2B', 'B2C']

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ทุกประเภท')

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.nameEn ?? '').toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'ทุกประเภท' || c.type === typeFilter
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
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-primary">{c.name}</p>
                  {c.nameEn && <p className="text-xs text-muted-foreground">{c.nameEn}</p>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      c.type === 'B2B'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700',
                    )}
                  >
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <p>{c.contact}</p>
                  {c.phone && <p className="text-xs">{c.phone}</p>}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{c.taxId ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.startDate}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
