'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

type RoastLevel = 'คั่วอ่อน' | 'คั่วกลาง' | 'คั่วเข้ม' | 'คั่วกลางอ่อนเข้ม' | 'คั่วอ่อนกลาง' | 'คั่วกลางอ่อนเข้ม'
type BatchStatus = 'รอคิว' | 'กำลังคั่ว' | 'ทำเย็น' | 'บรรจุภัณฑ์' | 'พร้อมส่ง'

type Batch = {
  id: string
  batchId: string
  origin: string
  product: string
  roastLevel: string
  date: string
  weightIn: number
  weightOut: number
  status: BatchStatus
  orderId?: string
  customer?: string
  orderItems?: number
  orderKg?: number
  orderProducts?: string[]
}

const COLUMNS: { key: BatchStatus; label: string; color: string; border: string }[] = [
  { key: 'รอคิว', label: 'รอคิว', color: 'bg-gray-100', border: 'border-gray-300' },
  { key: 'กำลังคั่ว', label: 'กำลังคั่ว', color: 'bg-orange-50', border: 'border-orange-300' },
  { key: 'ทำเย็น', label: 'ทำเย็น', color: 'bg-blue-50', border: 'border-blue-300' },
  { key: 'บรรจุภัณฑ์', label: 'บรรจุภัณฑ์', color: 'bg-purple-50', border: 'border-purple-300' },
  { key: 'พร้อมส่ง', label: 'พร้อมส่ง', color: 'bg-green-50', border: 'border-green-400' },
]

const MOCK_BATCHES: Batch[] = [
  {
    id: '1', batchId: 'BNTCH-2026-0131', origin: 'อราปิก้า', product: 'Maverick',
    roastLevel: 'คั่วกลางอ่อนเข้ม', date: '2026-06-17', weightIn: 56.0, weightOut: 46.1,
    status: 'ทำเย็น',
  },
  {
    id: '2', batchId: 'BNTCH-2026-0121', origin: 'โรบัสต้า ฉุนพร', product: 'บทวโรยน รีสอร์ท กรีน',
    roastLevel: 'คั่วกลางอ่อนเข้ม', date: '2026-06-16', weightIn: 84.0, weightOut: 67.3,
    status: 'บรรจุภัณฑ์',
    orderId: 'ORD-2026-0251', customer: 'กฤษกรส แดงเลิศ',
    orderItems: 4, orderKg: 1.60,
    orderProducts: ['Brazil Santos 100% - คั่วกลาง ×0...', 'Ethiopia 100% ×0.2 kg', '+2 รายการ'],
  },
  {
    id: '3', batchId: 'BNTCH-2026-0121', origin: 'อราปิก้า', product: 'บทวโรยน รีสอร์ท กรีน',
    roastLevel: 'คั่วอ่อน', date: '2026-06-16', weightIn: 24.0, weightOut: 20.5,
    status: 'บรรจุภัณฑ์',
    orderId: 'ORD-2026-0251', customer: 'โอเชี่ยนรีสอร์ท กรุ๊ป จำกัด',
    orderItems: 2, orderKg: 405.00,
    orderProducts: ['Splendente ×305 kg', 'Maverick ×100 kg'],
  },
]

const roastLevelColor: Record<string, string> = {
  'คั่วอ่อน': 'bg-amber-100 text-amber-700 border border-amber-200',
  'คั่วกลาง': 'bg-orange-100 text-orange-700 border border-orange-200',
  'คั่วเข้ม': 'bg-red-100 text-red-700 border border-red-200',
  'คั่วกลางอ่อนเข้ม': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  'คั่วอ่อนกลาง': 'bg-lime-100 text-lime-700 border border-lime-200',
}

export default function RoastQueuePage() {
  const [batches] = useState(MOCK_BATCHES)

  const countByStatus = (status: BatchStatus) =>
    batches.filter((b) => b.status === status).length

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight">คิวการคั่ว</h1>
          <p className="text-sm text-muted-foreground">Roast Queue</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          สร้าง Batch
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const cards = batches.filter((b) => b.status === col.key)
          return (
            <div key={col.key} className="flex flex-col min-w-[210px] w-[210px] shrink-0">
              {/* Column header */}
              <div className={cn('rounded-t-xl border-t-[3px] bg-white border-x border-b border-border px-3 py-2.5 flex items-center justify-between', col.border)}>
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-sm font-semibold text-muted-foreground">{countByStatus(col.key)}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 rounded-b-xl border border-t-0 border-border bg-muted/20 p-2 min-h-[120px]">
                {cards.map((batch) => (
                  <div key={batch.id} className="rounded-xl border border-border bg-white p-3 shadow-sm space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="font-semibold text-sm leading-tight">{batch.origin}</p>
                        <p className="text-xs text-muted-foreground">{batch.product}</p>
                        <p className="text-xs text-muted-foreground">{batch.batchId}</p>
                      </div>
                      <button className="text-xs text-muted-foreground hover:text-destructive shrink-0">ลบ</button>
                    </div>

                    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', roastLevelColor[batch.roastLevel] ?? 'bg-gray-100 text-gray-700')}>
                      {batch.roastLevel}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      {batch.date}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {batch.weightIn} กก. <ArrowRight className="inline h-3 w-3" /> <span className="font-medium text-foreground">{batch.weightOut} กก.</span>
                      <span className="ml-1 text-red-500">({(((batch.weightOut - batch.weightIn) / batch.weightIn) * 100).toFixed(1)}%)</span>
                    </div>

                    {/* Order card inside batch */}
                    {batch.orderId && (
                      <div className="rounded-lg bg-purple-50 border border-purple-200 p-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-purple-700">{batch.orderId}</span>
                          <span className="text-xs text-purple-500">ออเดอร์</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{batch.customer}</p>
                        <p className="text-xs text-muted-foreground">{batch.orderItems} รายการ · {batch.orderKg} กก.</p>
                        {batch.orderProducts?.map((p, i) => (
                          <p key={i} className="text-xs text-muted-foreground truncate">{p}</p>
                        ))}
                        <button className="mt-1 w-full rounded-lg bg-purple-100 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200 transition-colors flex items-center justify-center gap-1">
                          บรรจุเสร็จ <ArrowRight className="h-3 w-3" /> พร้อมส่ง
                        </button>
                      </div>
                    )}

                    {!batch.orderId && (
                      <button className="w-full rounded-lg bg-blue-50 border border-blue-200 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                        บรรจุ <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-xs text-muted-foreground/50">ไม่มีรายการ</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
