'use client'

import { useMemo, useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Plus, Coffee, Flame, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getBatchesInRange,
  createBatch,
  updateBatch,
  deleteBatch,
  type RoastBatch,
} from '@/app/actions/roast-batches'
import { BatchDialog } from '@/components/dashboard/batch-dialog'
import { cn } from '@/lib/utils'

const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]
const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export const STATUS_META: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  scheduled: {
    label: 'รอคั่ว',
    dot: 'bg-chart-5',
    badge: 'bg-secondary text-secondary-foreground',
  },
  roasting: {
    label: 'กำลังคั่ว',
    dot: 'bg-primary',
    badge: 'bg-accent text-accent-foreground',
  },
  done: {
    label: 'คั่วเสร็จ',
    dot: 'bg-primary',
    badge: 'bg-primary text-primary-foreground',
  },
  cancelled: {
    label: 'ยกเลิก',
    dot: 'bg-muted-foreground',
    badge: 'bg-muted text-muted-foreground line-through',
  },
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function ymd(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}
function todayStr() {
  const d = new Date()
  return ymd(d.getFullYear(), d.getMonth(), d.getDate())
}

export function RoastCalendar({
  initialYear,
  initialMonth,
  initialBatches,
}: {
  initialYear: number
  initialMonth: number
  initialBatches: RoastBatch[]
}) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [batches, setBatches] = useState<RoastBatch[]>(initialBatches)
  const [, startTransition] = useTransition()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RoastBatch | null>(null)
  const [presetDate, setPresetDate] = useState<string>(todayStr())

  const today = todayStr()

  async function reload(y: number, m: number) {
    const start = `${m === 0 ? y - 1 : y}-${pad(m === 0 ? 12 : m)}-01`
    const end = `${m >= 10 ? y + 1 : y}-${pad(((m + 2) % 12) + 1)}-01`
    const data = await getBatchesInRange(start, end)
    setBatches(data)
  }

  function goto(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setMonth(m)
    setYear(y)
    startTransition(() => {
      reload(y, m)
    })
  }

  function goToday() {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    startTransition(() => reload(d.getFullYear(), d.getMonth()))
  }

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const grid: { date: string; day: number; inMonth: boolean }[] = []

    // leading days from prev month
    const prevDays = new Date(year, month, 0).getDate()
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const day = prevDays - i
      const pm = month === 0 ? 11 : month - 1
      const py = month === 0 ? year - 1 : year
      grid.push({ date: ymd(py, pm, day), day, inMonth: false })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push({ date: ymd(year, month, day), day, inMonth: true })
    }
    // trailing to fill full weeks
    let next = 1
    while (grid.length % 7 !== 0) {
      const nm = month === 11 ? 0 : month + 1
      const ny = month === 11 ? year + 1 : year
      grid.push({ date: ymd(ny, nm, next), day: next, inMonth: false })
      next++
    }
    return grid
  }, [year, month])

  const byDate = useMemo(() => {
    const map = new Map<string, RoastBatch[]>()
    for (const b of batches) {
      const key = String(b.scheduledDate)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(b)
    }
    return map
  }, [batches])

  const monthBatches = batches.filter((b) => {
    const d = String(b.scheduledDate)
    return d.startsWith(`${year}-${pad(month + 1)}`)
  })
  const totalKg = monthBatches.reduce((s, b) => s + b.quantityKg, 0)

  function openCreate(date: string) {
    setEditing(null)
    setPresetDate(date)
    setDialogOpen(true)
  }
  function openEdit(b: RoastBatch) {
    setEditing(b)
    setPresetDate(String(b.scheduledDate))
    setDialogOpen(true)
  }

  async function handleSave(values: Parameters<typeof createBatch>[0], id?: number) {
    if (id) await updateBatch(id, values)
    else await createBatch(values)
    await reload(year, month)
  }
  async function handleDelete(id: number) {
    await deleteBatch(id)
    await reload(year, month)
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<Coffee className="h-5 w-5" />}
          label="คิวคั่วเดือนนี้"
          value={`${monthBatches.length} แบตช์`}
        />
        <SummaryCard
          icon={<Scale className="h-5 w-5" />}
          label="ปริมาณรวม"
          value={`${totalKg} กก.`}
        />
        <SummaryCard
          icon={<Flame className="h-5 w-5" />}
          label="กำลังคั่ว"
          value={`${monthBatches.filter((b) => b.status === 'roasting').length} แบตช์`}
        />
      </div>

      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight">
            {MONTHS[month]} {year + 543}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goto(-1)} aria-label="เดือนก่อนหน้า">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => goto(1)} aria-label="เดือนถัดไป">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8" onClick={goToday}>
              วันนี้
            </Button>
          </div>
        </div>
        <Button onClick={() => openCreate(today)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          จองคิวคั่ว
        </Button>
      </div>

      {/* calendar grid */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/50">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayBatches = byDate.get(cell.date) ?? []
            const isToday = cell.date === today
            return (
              <button
                key={`${cell.date}-${idx}`}
                onClick={() => openCreate(cell.date)}
                className={cn(
                  'group min-h-24 border-b border-r border-border p-1.5 text-left align-top transition-colors hover:bg-secondary/40 focus:outline-none focus-visible:bg-secondary/60',
                  (idx + 1) % 7 === 0 && 'border-r-0',
                  !cell.inMonth && 'bg-muted/30',
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      isToday
                        ? 'bg-primary text-primary-foreground'
                        : cell.inMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/60',
                    )}
                  >
                    {cell.day}
                  </span>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="flex flex-col gap-1">
                  {dayBatches.slice(0, 3).map((b) => {
                    const meta = STATUS_META[b.status] ?? STATUS_META.scheduled
                    return (
                      <span
                        key={b.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          openEdit(b)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation()
                            openEdit(b)
                          }
                        }}
                        className={cn(
                          'flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[11px] font-medium',
                          meta.badge,
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.dot)} />
                        <span className="truncate">{b.title}</span>
                      </span>
                    )
                  })}
                  {dayBatches.length > 3 && (
                    <span className="px-1.5 text-[11px] text-muted-foreground">
                      +{dayBatches.length - 3} อื่น ๆ
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
            {meta.label}
          </div>
        ))}
      </div>

      <BatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        presetDate={presetDate}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/40 text-accent-foreground">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}
