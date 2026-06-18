'use client'

import { useMemo, useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCalendarEvents, createCalendarEvent } from '@/app/actions/calendar'
import { cn } from '@/lib/utils'

type CalendarEvent = {
  id: string
  title: string
  date: string | null
  time: string | null
  end_time: string | null
  category: string
  notes: string | null
  source: string
  ref_id: string | null
}

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]
const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const WEEKDAY_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

function pad(n: number) { return String(n).padStart(2, '0') }
function ymd(y: number, m: number, d: number) { return `${y}-${pad(m)}-${pad(d)}` }
function todayStr() {
  const d = new Date()
  return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate())
}
function thaiYear(y: number) { return y + 543 }
function formatThaiDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  return `วัน${DAYS_TH[dow]}ที่ ${d} ${MONTHS_TH[m - 1]} ${thaiYear(y)}`
}

const CATEGORIES: {
  key: string
  label: string
  chipBg: string
  chipText: string
  dotBg: string
  eventBg: string
  eventText: string
}[] = [
  { key: 'b2b',      label: 'B2B',      chipBg: 'bg-blue-50 hover:bg-blue-100',     chipText: 'text-blue-700',   dotBg: 'bg-blue-500',   eventBg: 'bg-blue-50 border border-blue-200',     eventText: 'text-blue-700' },
  { key: 'b2c',      label: 'B2C',      chipBg: 'bg-purple-50 hover:bg-purple-100', chipText: 'text-purple-700', dotBg: 'bg-purple-500', eventBg: 'bg-purple-50 border border-purple-200', eventText: 'text-purple-700' },
  { key: 'roast',    label: 'คั่วกาแฟ', chipBg: 'bg-orange-50 hover:bg-orange-100', chipText: 'text-orange-700', dotBg: 'bg-orange-500', eventBg: 'bg-orange-50 border border-orange-200', eventText: 'text-orange-700' },
  { key: 'sourcing', label: 'Sourcing', chipBg: 'bg-green-50 hover:bg-green-100',   chipText: 'text-green-700',  dotBg: 'bg-green-500',  eventBg: 'bg-green-50 border border-green-200',   eventText: 'text-green-700' },
  { key: 'content',  label: 'Content',  chipBg: 'bg-pink-50 hover:bg-pink-100',     chipText: 'text-pink-700',   dotBg: 'bg-pink-500',   eventBg: 'bg-pink-50 border border-pink-200',     eventText: 'text-pink-700' },
  { key: 'admin',    label: 'ธุรกิจ',   chipBg: 'bg-gray-100 hover:bg-gray-200',    chipText: 'text-gray-600',   dotBg: 'bg-gray-400',   eventBg: 'bg-gray-100 border border-gray-200',    eventText: 'text-gray-600' },
]
const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]))
function getCat(key: string) { return catMap[key] ?? CATEGORIES[5] }

const CHIP_MAX = 3

export function CalendarView({
  initialYear,
  initialMonth,
  initialEvents,
}: {
  initialYear: number
  initialMonth: number  // 1-indexed
  initialEvents: CalendarEvent[]
}) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth) // 1-indexed
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [, startTransition] = useTransition()
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(CATEGORIES.map((c) => c.key)))
  const [selectedDate, setSelectedDate] = useState<string>(todayStr())

  const today = todayStr()

  async function reload(y: number, m: number) {
    const data = await getCalendarEvents(y, m)
    setEvents(data)
  }

  function goto(delta: number) {
    let m = month + delta
    let y = year
    if (m < 1) { m = 12; y -= 1 }
    else if (m > 12) { m = 1; y += 1 }
    setMonth(m)
    setYear(y)
    startTransition(() => reload(y, m))
  }

  function goToday() {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    setYear(y)
    setMonth(m)
    setSelectedDate(todayStr())
    startTransition(() => reload(y, m))
  }

  function toggleFilter(key: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const grid: { date: string; day: number; inMonth: boolean; isSunday: boolean }[] = []

    const prevDays = new Date(year, month - 1, 0).getDate()
    const prevM = month === 1 ? 12 : month - 1
    const prevY = month === 1 ? year - 1 : year
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const day = prevDays - i
      grid.push({ date: ymd(prevY, prevM, day), day, inMonth: false, isSunday: grid.length % 7 === 0 })
    }
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push({ date: ymd(year, month, day), day, inMonth: true, isSunday: grid.length % 7 === 0 })
    }
    let next = 1
    const nextM = month === 12 ? 1 : month + 1
    const nextY = month === 12 ? year + 1 : year
    while (grid.length % 7 !== 0) {
      grid.push({ date: ymd(nextY, nextM, next), day: next, inMonth: false, isSunday: grid.length % 7 === 0 })
      next++
    }
    return grid
  }, [year, month])

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      if (!e.date) continue
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    return map
  }, [events])

  const selectedEvents = (byDate.get(selectedDate) ?? []).filter((e) => activeFilters.has(e.category))

  return (
    <div className="flex flex-col gap-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-1 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => goto(-1)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="w-44 text-center text-base font-semibold">
            {MONTHS_TH[month - 1]} {thaiYear(year)}
          </h2>
          <button onClick={() => goto(1)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-sm" onClick={goToday}>วันนี้</Button>
          <Button size="sm" className="h-8 gap-1.5 text-sm">
            <Plus className="h-3.5 w-3.5" />
            เพิ่มกิจกรรม
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
        {CATEGORIES.map((cat) => {
          const on = activeFilters.has(cat.key)
          return (
            <button
              key={cat.key}
              onClick={() => toggleFilter(cat.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
                on ? cn(cat.chipBg, cat.chipText) : 'bg-muted/50 text-muted-foreground/60 hover:bg-muted',
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', on ? cat.dotBg : 'bg-muted-foreground/40')} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAY_SHORT.map((d, i) => (
            <div key={d} className={cn('py-2 text-center text-xs font-semibold', i === 0 ? 'text-red-500' : 'text-muted-foreground')}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const allDay = byDate.get(cell.date) ?? []
            const dayEvents = allDay.filter((e) => activeFilters.has(e.category))
            const isToday = cell.date === today
            const isSelected = cell.date === selectedDate
            const visible = dayEvents.slice(0, CHIP_MAX)
            const overflow = dayEvents.length - CHIP_MAX

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
                <div className="mb-1 flex items-center justify-between">
                  <span className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isToday ? 'bg-blue-600 font-bold text-white'
                      : cell.isSunday ? (cell.inMonth ? 'text-red-500' : 'text-red-300')
                      : cell.inMonth ? 'text-foreground' : 'text-muted-foreground/50',
                  )}>
                    {cell.day}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {visible.map((ev) => {
                    const cat = getCat(ev.category)
                    return (
                      <span
                        key={ev.id}
                        className={cn(
                          'flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-[11px] font-medium',
                          cat.eventBg, cat.eventText,
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', cat.dotBg)} />
                        <span className="truncate">{ev.title}</span>
                      </span>
                    )
                  })}
                  {overflow > 0 && (
                    <span className="px-1.5 text-[11px] text-muted-foreground">+{overflow} เพิ่มเติม</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected day panel */}
      <div className="mt-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <p className="text-sm font-semibold">{formatThaiDate(selectedDate)}</p>
            {selectedEvents.length === 0 && <p className="text-xs text-muted-foreground">ไม่มีกิจกรรม</p>}
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Plus className="h-3.5 w-3.5" />
            เพิ่มงานวันนี้
          </Button>
        </div>

        {selectedEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">ไม่มีกิจกรรมในวันนี้</p>
        ) : (
          <ul className="divide-y divide-border">
            {selectedEvents.map((ev) => {
              const cat = getCat(ev.category)
              return (
                <li key={ev.id} className="flex items-start gap-3 px-5 py-3">
                  <span className={cn('mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full', cat.dotBg)} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{ev.title}</p>
                    {ev.notes && <p className="text-xs text-muted-foreground">{ev.notes}</p>}
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium', cat.eventBg, cat.eventText)}>
                    {cat.label}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
