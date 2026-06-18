import { getCalendarEvents } from '@/app/actions/calendar'
import { CalendarView } from '@/components/dashboard/calendar-view'

export default async function CalendarPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-indexed

  const events = await getCalendarEvents(year, month)

  return (
    <CalendarView
      initialYear={year}
      initialMonth={month}
      initialEvents={events}
    />
  )
}
