import { getBatchesInRange } from '@/app/actions/roast-batches'
import { RoastCalendar } from '@/components/dashboard/roast-calendar'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default async function CalendarPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-indexed

  // Fetch a window covering the previous, current, and next month so the
  // grid's leading/trailing days are populated without an extra round trip.
  const start = `${month === 0 ? year - 1 : year}-${pad(month === 0 ? 12 : month)}-01`
  const end = `${month >= 10 ? year + 1 : year}-${pad(((month + 2) % 12) + 1)}-01`

  const batches = await getBatchesInRange(start, end)

  return (
    <RoastCalendar
      initialYear={year}
      initialMonth={month}
      initialBatches={batches}
    />
  )
}
