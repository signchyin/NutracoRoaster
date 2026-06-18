'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { advanceBatchStage, deleteRoastBatch } from '@/app/actions/roast-batches'
import type { RoastBatch } from '@/lib/db/schema'

type BatchWithOrder = RoastBatch & {
  order: { order_number: string; customer_name?: string } | null
}

type KanbanStatus = 'queued' | 'roasting' | 'cooling' | 'packing' | 'ready'

const COLUMNS: { key: KanbanStatus; label: string; borderColor: string }[] = [
  { key: 'queued',   label: 'รอคิว',        borderColor: 'border-gray-300' },
  { key: 'roasting', label: 'กำลังคั่ว',    borderColor: 'border-orange-300' },
  { key: 'cooling',  label: 'ทำเย็น',        borderColor: 'border-blue-300' },
  { key: 'packing',  label: 'บรรจุภัณฑ์',   borderColor: 'border-purple-300' },
  { key: 'ready',    label: 'พร้อมส่ง',      borderColor: 'border-green-400' },
]

const ROAST_LEVEL_COLOR: Record<string, string> = {
  'คั่วอ่อน': 'bg-amber-100 text-amber-700 border border-amber-200',
  'คั่วกลาง': 'bg-orange-100 text-orange-700 border border-orange-200',
  'คั่วเข้ม': 'bg-red-100 text-red-700 border border-red-200',
  'คั่วกลางอ่อนเข้ม': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  'คั่วกลางค่อนเข้ม': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  'คั่วอ่อนกลาง': 'bg-lime-100 text-lime-700 border border-lime-200',
}

const ADVANCE_LABEL: Partial<Record<KanbanStatus, string>> = {
  queued:   'เริ่มคั่ว →',
  roasting: 'ทำเย็น →',
  cooling:  'บรรจุ →',
  packing:  'พร้อมส่ง →',
}

export default function RoastQueueClient({ batches }: { batches: BatchWithOrder[] }) {
  const [pending, startTransition] = useTransition()

  const activeBatches = batches.filter((b) => b.status !== 'complete')

  function advance(id: string) {
    startTransition(() => advanceBatchStage(id))
  }

  function remove(id: string) {
    startTransition(() => deleteRoastBatch(id))
  }

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
          const cards = activeBatches.filter((b) => b.status === col.key)
          return (
            <div key={col.key} className="flex flex-col min-w-[210px] w-[210px] shrink-0">
              {/* Column header */}
              <div className={cn('rounded-t-xl border-t-[3px] bg-white border-x border-b border-border px-3 py-2.5 flex items-center justify-between', col.borderColor)}>
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-sm font-semibold text-muted-foreground">{cards.length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 rounded-b-xl border border-t-0 border-border bg-muted/20 p-2 min-h-[120px]">
                {cards.map((batch) => {
                  const chargeKg = Number(batch.charge_kg)
                  const outputKg = batch.output_kg ? Number(batch.output_kg) : null
                  const lossPct = outputKg != null && chargeKg > 0
                    ? ((chargeKg - outputKg) / chargeKg * 100).toFixed(1)
                    : null
                  const lots = (batch.lot_selections as Array<{ bean_name: string }> | null) ?? []
                  const originLabel = lots.length > 0 ? lots[0].bean_name : batch.roast_level

                  return (
                    <div key={batch.id} className="rounded-xl border border-border bg-white p-3 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className="font-semibold text-sm leading-tight">{originLabel}</p>
                          {batch.batch_name && <p className="text-xs text-muted-foreground">{batch.batch_name}</p>}
                          <p className="text-xs text-muted-foreground">{batch.batch_number}</p>
                        </div>
                        <button
                          disabled={pending}
                          onClick={() => remove(batch.id)}
                          className="text-xs text-muted-foreground hover:text-destructive shrink-0 disabled:opacity-50"
                        >
                          ลบ
                        </button>
                      </div>

                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', ROAST_LEVEL_COLOR[batch.roast_level] ?? 'bg-gray-100 text-gray-700')}>
                        {batch.roast_level}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        {batch.scheduled_date}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {chargeKg} กก.
                        {outputKg != null && (
                          <>
                            {' '}<ArrowRight className="inline h-3 w-3" />
                            {' '}<span className="font-medium text-foreground">{outputKg} กก.</span>
                            {lossPct && <span className="ml-1 text-red-500">({lossPct}%)</span>}
                          </>
                        )}
                      </div>

                      {/* Linked order */}
                      {batch.order && (
                        <div className="rounded-lg bg-purple-50 border border-purple-200 p-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-purple-700">{batch.order.order_number}</span>
                            <span className="text-xs text-purple-500">ออเดอร์</span>
                          </div>
                          {batch.order.customer_name && (
                            <p className="text-xs text-muted-foreground">{batch.order.customer_name}</p>
                          )}
                        </div>
                      )}

                      {/* Advance button */}
                      {ADVANCE_LABEL[col.key as KanbanStatus] && (
                        <button
                          disabled={pending}
                          onClick={() => advance(batch.id)}
                          className="w-full rounded-lg bg-blue-50 border border-blue-200 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {ADVANCE_LABEL[col.key as KanbanStatus]}
                        </button>
                      )}
                    </div>
                  )
                })}

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
