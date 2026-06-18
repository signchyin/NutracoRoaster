'use client'

import { useMemo, useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
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

// ─── Thai locale helpers ────────────────────────────────────────────────────

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]
const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const WEEKDAY_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

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
function thaiYear(y: number) {
  return y + 543
}
function formatThaiDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  return `วัน${DAYS_TH[dow]}ที่ ${d} ${MONTHS_TH[m - 1]} ${thaiYear(y)}`
}

// ─── Category / type definitions ───────────────────────────────────────────

// In this roastery context the "categories" map to roast level / status type.
// We use them as visual filter chips exactly like the reference design.
export const CATEGORIES: {
  key: string
  label: string
  chipBg: string       // pill background (filter chip)
  chipText: string     // pill text
  dotBg: string        // coloured dot inside chip
  eventBg: string      // event chip bg in calendar cell
  eventText: string    // event chip text
}[] = [
  {
    key: 'scheduled',
    label: 'รอคั่ว',
    chipBg: 'bg-blue-50 hover:bg-blue-100',
    chipText: 'text-blue-700',
    dotBg: 'bg-blue-500',
    eventBg: 'bg-blue-50 border border-blue-200',
    eventText: 'text-blue-700',
  },
  {
    key: 'roasting',
    label: 'กำลังคั่ว',
    chipBg: 'bg-orange-50 hover:bg-orange-100',
    chipText: 'text-orange-700',
    dotBg: 'bg-orange-500',
    eventBg: 'bg-orange-50 border border-orange-200',
    eventText: 'text-orange-700',
  },
  {
    key: 'done',
    label: 'คั่วเสร็จ',
    chipBg: 'bg-green-50 hover:bg-green-100',
    chipText: 'text-green-700',
    dotBg: 'bg-green-500',
    eventBg: 'bg-green-50 border border-green-200',
    eventText: 'text-green-700',
  },
  {
    key: 'cancelled',
    label: 'ยกเลิก',
    chipBg: 'bg-gray-100 hover:bg-gray-200',
    chipText: 'text-gray-500',
    dotBg: 'bg-gray-400',
    eventBg: 'bg-gray-100 border border-gray-200',
    eventText: 'text-gray-500',
  },
]

const categoryMap = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))

function getCat(status: string) {
  return categoryMap[status] ?? CATEGORIES[0]
}

// ─── Component ──────────────────────────────────────────────────────────────

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

  // active filters – all on by default
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.key)),
  )

  // selected day (for the detail panel)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr())

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RoastBatch | null>(null)
  const [presetDate, setPresetDate] = useState<string>(todayStr())

  const today = todayStr()

  // ── data helpers ──────────────────────────────────────────────────────────

  async function reload(y: number, m: number) {
    const prevM = m === 0 ? 11 : m - 1
    const prevY = m === 0 ? y - 1 : y
    const nextM = m === 11 ? 0 : m + 1
    const nextY = m === 11 ? y + 1 : y
    const start = `${prevY}-${pad(prevM + 1)}-01`
    const end = `${nextY}-${pad(nextM + 1)}-28`
    const data = await getBatchesInRange(start, end)
    setBatches(data)
  }

  function goto(delta: number) {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y -= 1 }
    else if (m > 11) { m = 0; y += 1 }
    setMonth(m)
    setYear(y)
    startTransition(() => reload(y, m))
  }

  function goToday() {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    setSelectedDate(todayStr())
    startTransition(() => reload(d.getFullYear(), d.getMonth()))
  }

  // ── filter chips ──────────────────────────────────────────────────────────

  function toggleFilter(key: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev // keep at least one active
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // ── calendar grid ─────────────────────────────────────────────────────────

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const grid: { date: string; day: number; inMonth: boolean; isSunday: boolean }[] = []

    const prevDays = new Date(year, month, 0).getDate()
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const day = prevDays - i
      const pm = month === 0 ? 11 : month - 1
      const py = month === 0 ? year - 1 : year
      grid.push({ date: ymd(py, pm, day), day, inMonth: false, isSunday: grid.length % 7 === 0 })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push({ date: ymd(year, month, day), day, inMonth: true, isSunday: grid.length % 7 === 0 })
    }
    let next = 1
    while (grid.length % 7 !== 0) {
      const nm = month === 11 ? 0 : month + 1
      const ny = month === 11 ? year + 1 : year
      grid.push({ date: ymd(ny, nm, next), day: next, inMonth: false, isSunday: grid.length % 7 === 0 })
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

  // ── dialog helpers ────────────────────────────────────────────────────────

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

  // ── selected-day events ───────────────────────────────────────────────────
  const selectedBatches = (byDate.get(selectedDate) ?? []).filter((b) =>
    activeFilters.has(b.status),
  )

  const CHIP_MAX = 3

  return (
    <div className="flex flex-col gap-0">
      {/* ── toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-1 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goto(-1)}
            aria-label="เดือนก่อนหน้า"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="w-40 text-center text-base font-semibold text-foreground">
            {MONTHS_TH[month]} {thaiYear(year)}
          </h2>
          <button
            onClick={() => goto(1)}
            aria-label="เดือนถัดไป"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-sm" onClick={goToday}>
            วันนี้
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-sm"
            onClick={() => openCreate(selectedDate)}
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มงาน
          </Button>
        </div>
      </div>

      {/* ── filter chips ────────────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
        {CATEGORIES.map((cat) => {
          const on = activeFilters.has(cat.key)
          return (
            <button
              key={cat.key}
              onClick={() => toggleFilter(cat.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
                on
                  ? cn(cat.chipBg, cat.chipText)
                  : 'bg-muted/50 text-muted-foreground/60 hover:bg-muted',
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  on ? cat.dotBg : 'bg-muted-foreground/40',
                )}
              />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ── calendar grid ───────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* weekday header */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAY_SHORT.map((d, i) => (
            <div
              key={d}
              className={cn(
                'py-2 text-center text-xs font-semibold',
                i === 0 ? 'text-red-500' : 'text-muted-foreground',
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const allDayBatches = byDate.get(cell.date) ?? []
            const dayBatches = allDayBatches.filter((b) => activeFilters.has(b.status))
            const isToday = cell.date === today
            const isSelected = cell.date === selectedDate
            const visible = dayBatches.slice(0, CHIP_MAX)
            const overflow = dayBatches.length - CHIP_MAX

            return (
              <div
                key={`${cell.date}-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDate(cell.date)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedDate(cell.date)}
                className={cn(
                  'group min-h-[6rem] cursor-pointer border-b border-r border-border p-1.5 align-top transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  (idx + 1) % 7 === 0 && 'border-r-0',
                  !cell.inMonth && 'bg-muted/20',
                  isSelected && cell.inMonth && 'bg-blue-50/60',
                  !isSelected && 'hover:bg-secondary/30',
                )}
              >
                {/* date number */}
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      isToday
                        ? 'bg-blue-600 font-bold text-white'
                        : cell.isSunday
                          ? cell.inMonth ? 'text-red-500' : 'text-red-300'
                          : cell.inMonth
                            ? 'text-foreground'
                            : 'text-muted-foreground/50',
                    )}
                  >
                    {cell.day}
                  </span>
                </div>

                {/* event chips */}
                <div className="flex flex-col gap-0.5">
                  {visible.map((b) => {
                    const cat = getCat(b.status)
                    return (
                      <button
                        key={b.id}
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
                          'flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-80',
                          cat.eventBg,
                          cat.eventText,
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', cat.dotBg)} />
                        <span className="truncate">
                          {b.startTime ? `${b.startTime} ` : ''}
                          คั่ว: {b.title}
                          {b.quantityKg > 0 ? ` (${b.quantityKg}กก.)` : ''}
                        </span>
                      </button>
                    )
                  })}
                  {overflow > 0 && (
                    <span className="px-1.5 text-[11px] text-muted-foreground">
                      +{overflow} เพิ่มเติม
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── selected-day detail panel ─────────────────────────────────── */}
      <div className="mt-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {formatThaiDate(selectedDate)}
            </p>
            {selectedBatches.length === 0 && (
              <p className="text-xs text-muted-foreground">ไม่มีกิจกรรม</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => openCreate(selectedDate)}
          >
            <Plus className="h-3.5 w-3.5" />
            เพิ่มงานวันนี้
          </Button>
        </div>

        {selectedBatches.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            ไม่มีกิจกรรมในวันนี้
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {selectedBatches.map((b) => {
              const cat = getCat(b.status)
              return (
                <li key={b.id}>
                  <button
                    onClick={() => openEdit(b)}
                    className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-secondary/30"
                  >
                    <span
                      className={cn(
                        'mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full',
                        cat.dotBg,
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        คั่ว: {b.title}
                        {b.quantityKg > 0 ? ` (${b.quantityKg} กก.)` : ''}
                      </p>
                      {(b.beanOrigin || b.startTime) && (
                        <p className="truncate text-xs text-muted-foreground">
                          {[b.startTime, b.beanOrigin].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        cat.eventBg,
                        cat.eventText,
                      )}
                    >
                      {cat.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
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
