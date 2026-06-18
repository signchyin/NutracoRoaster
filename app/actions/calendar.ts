'use server'

import { db } from '@/lib/db'
import { calendarEvents, orders, customers, roastBatches } from '@/lib/db/schema'
import { and, eq, gte, lte } from 'drizzle-orm'
import { getTenantId, newId } from '@/lib/db/helpers'
import { revalidatePath } from 'next/cache'

export async function getCalendarEvents(year: number, month: number) {
  const tenantId = await getTenantId()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  // Manual calendar events
  const manual = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.tenant_id, tenantId),
        gte(calendarEvents.date, start),
        lte(calendarEvents.date, end),
      ),
    )

  // Auto-generate from orders (delivery dates in this month)
  const orderEvents = await db
    .select({
      id: orders.id,
      order_number: orders.order_number,
      delivery_date: orders.delivery_date,
      customer_id: orders.customer_id,
      status: orders.status,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenant_id, tenantId),
        gte(orders.delivery_date, start),
        lte(orders.delivery_date, end),
      ),
    )

  // Customer names for order events
  const custMap: Record<string, string> = {}
  if (orderEvents.length > 0) {
    const ids = [...new Set(orderEvents.map((o) => o.customer_id))]
    const custs = await db
      .select({ id: customers.id, name: customers.name, type: customers.type })
      .from(customers)
      .where(eq(customers.tenant_id, tenantId))
    for (const c of custs) custMap[c.id] = c.name
  }

  // Auto-generate from roast batches
  const batchEvents = await db
    .select({
      id: roastBatches.id,
      batch_number: roastBatches.batch_number,
      batch_name: roastBatches.batch_name,
      scheduled_date: roastBatches.scheduled_date,
      roast_level: roastBatches.roast_level,
      charge_kg: roastBatches.charge_kg,
      status: roastBatches.status,
    })
    .from(roastBatches)
    .where(
      and(
        eq(roastBatches.tenant_id, tenantId),
        gte(roastBatches.scheduled_date, start),
        lte(roastBatches.scheduled_date, end),
      ),
    )

  // Combine into unified event list
  const allEvents = [
    ...manual.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      end_time: e.end_time,
      category: e.category,
      notes: e.notes,
      source: e.source,
      ref_id: e.ref_id,
    })),
    ...orderEvents.map((o) => ({
      id: `order-${o.id}`,
      title: `${o.order_number} · ${custMap[o.customer_id] ?? ''}`,
      date: o.delivery_date ?? '',
      time: null,
      end_time: null,
      category: 'b2b' as const,
      notes: null,
      source: 'order',
      ref_id: o.id,
    })),
    ...batchEvents.map((b) => ({
      id: `batch-${b.id}`,
      title: b.batch_name ?? b.batch_number,
      date: b.scheduled_date,
      time: null,
      end_time: null,
      category: 'roast' as const,
      notes: `${b.roast_level} · ${b.charge_kg} กก.`,
      source: 'batch',
      ref_id: b.id,
    })),
  ]

  return allEvents.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
}

export type CreateEventInput = {
  title: string
  date: string
  time?: string
  end_time?: string
  category: 'b2b' | 'b2c' | 'roast' | 'sourcing' | 'content' | 'admin'
  notes?: string
}

export async function createCalendarEvent(input: CreateEventInput) {
  const tenantId = await getTenantId()
  const id = newId()
  await db.insert(calendarEvents).values({
    id,
    tenant_id: tenantId,
    title: input.title,
    date: input.date,
    time: input.time ?? null,
    end_time: input.end_time ?? null,
    category: input.category,
    notes: input.notes ?? null,
    source: 'manual',
  })
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  return { id }
}

export async function updateCalendarEvent(id: string, input: Partial<CreateEventInput>) {
  const tenantId = await getTenantId()
  await db
    .update(calendarEvents)
    .set({ ...input, updated_at: new Date() })
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.tenant_id, tenantId)))
  revalidatePath('/dashboard')
}

export async function deleteCalendarEvent(id: string) {
  const tenantId = await getTenantId()
  await db
    .delete(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.tenant_id, tenantId)))
  revalidatePath('/dashboard')
}
