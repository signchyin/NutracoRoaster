'use server'
// v2
import { db } from '@/lib/db'
import { roastBatches, roastedInventory, orders, orderItems, products } from '@/lib/db/schema'
import { and, eq, sql, desc } from 'drizzle-orm'
import { getTenantId, newId } from '@/lib/db/helpers'
import { revalidatePath } from 'next/cache'

export async function getRoastBatches() {
  const tenantId = await getTenantId()
  const batches = await db
    .select()
    .from(roastBatches)
    .where(eq(roastBatches.tenant_id, tenantId))
    .orderBy(desc(roastBatches.created_at))

  // Attach order info for batches with an order_id
  const orderIds = [...new Set(batches.map((b) => b.order_id).filter(Boolean))] as string[]
  let orderMap: Record<string, { order_number: string; customer_id: string; customer_name: string; items: { product_name_snapshot: string; qty: string; total_kg: string }[] }> = {}

  if (orderIds.length > 0) {
    for (const oid of orderIds) {
      const [ord] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, oid))
        .limit(1)
      if (!ord) continue
      const items = await db.select().from(orderItems).where(eq(orderItems.order_id, oid))
      orderMap[oid] = {
        order_number: ord.order_number,
        customer_id: ord.customer_id,
        customer_name: '',
        items: items.map((i) => ({ product_name_snapshot: i.product_name_snapshot, qty: i.qty, total_kg: i.total_kg })),
      }
    }
  }

  return batches.map((b) => ({
    ...b,
    order: b.order_id ? (orderMap[b.order_id] ?? null) : null,
  }))
}

export async function getRoastedInventory() {
  const tenantId = await getTenantId()
  return db
    .select()
    .from(roastedInventory)
    .where(eq(roastedInventory.tenant_id, tenantId))
}

export type CreateBatchInput = {
  batch_name?: string
  order_id?: string
  status?: string
  roast_level: string
  charge_kg: number
  scheduled_date: string
  notes?: string
  lot_selections?: Array<{ lot_id: string; bean_name: string; pct: number; kg: number }>
}

export async function createRoastBatch(input: CreateBatchInput) {
  const tenantId = await getTenantId()

  const countRes = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(roastBatches)
    .where(eq(roastBatches.tenant_id, tenantId))
  const count = Number((countRes as Array<{ count: number }>)[0]?.count ?? 0) + 1
  const year = new Date().getFullYear()
  const batch_number = `BATCH-${year}-${String(count).padStart(4, '0')}`
  const id = newId()

  await db.insert(roastBatches).values({
    id,
    tenant_id: tenantId,
    batch_number,
    batch_name: input.batch_name ?? null,
    order_id: input.order_id ?? null,
    status: (input.status as typeof roastBatches.$inferInsert['status']) ?? 'queued',
    roast_level: input.roast_level,
    charge_kg: String(input.charge_kg),
    scheduled_date: input.scheduled_date,
    notes: input.notes ?? null,
    lot_selections: input.lot_selections ?? null,
  })

  revalidatePath('/dashboard/roast-queue')
  return { id, batch_number }
}

export async function advanceBatchStage(id: string) {
  const tenantId = await getTenantId()
  const [batch] = await db
    .select()
    .from(roastBatches)
    .where(and(eq(roastBatches.id, id), eq(roastBatches.tenant_id, tenantId)))
    .limit(1)
  if (!batch) return

  const stages: typeof batch.status[] = ['queued', 'roasting', 'cooling', 'packing', 'ready', 'complete']
  const nextIdx = stages.indexOf(batch.status) + 1
  if (nextIdx >= stages.length) return
  const nextStatus = stages[nextIdx]

  await db
    .update(roastBatches)
    .set({ status: nextStatus, updated_at: new Date(), ...(nextStatus === 'complete' ? { completed_at: new Date() } : {}) })
    .where(and(eq(roastBatches.id, id), eq(roastBatches.tenant_id, tenantId)))

  // If batch completes, upsert roasted inventory
  if (nextStatus === 'complete' && batch.output_kg) {
    const origin = batch.batch_name ?? batch.roast_level
    const existing = await db
      .select()
      .from(roastedInventory)
      .where(and(eq(roastedInventory.tenant_id, tenantId), eq(roastedInventory.origin, origin), eq(roastedInventory.roast_level, batch.roast_level)))
      .limit(1)
    if (existing.length > 0) {
      await db
        .update(roastedInventory)
        .set({ stock_kg: sql`stock_kg + ${batch.output_kg}`, updated_at: new Date() })
        .where(eq(roastedInventory.id, existing[0].id))
    } else {
      await db.insert(roastedInventory).values({
        id: newId(),
        tenant_id: tenantId,
        origin,
        roast_level: batch.roast_level,
        stock_kg: batch.output_kg,
      })
    }
  }

  revalidatePath('/dashboard/roast-queue')
  revalidatePath('/dashboard/roasted-inventory')
  revalidatePath('/dashboard/packing')
}

export async function updateBatchOutput(id: string, output_kg: number) {
  const tenantId = await getTenantId()
  const [batch] = await db.select().from(roastBatches).where(and(eq(roastBatches.id, id), eq(roastBatches.tenant_id, tenantId))).limit(1)
  if (!batch) return
  const loss_pct = batch.charge_kg ? ((Number(batch.charge_kg) - output_kg) / Number(batch.charge_kg)) * 100 : null
  await db
    .update(roastBatches)
    .set({ output_kg: String(output_kg), loss_pct: loss_pct != null ? String(loss_pct.toFixed(2)) : null, updated_at: new Date() })
    .where(and(eq(roastBatches.id, id), eq(roastBatches.tenant_id, tenantId)))
  revalidatePath('/dashboard/roast-queue')
}

export async function deleteRoastBatch(id: string) {
  const tenantId = await getTenantId()
  await db.delete(roastBatches).where(and(eq(roastBatches.id, id), eq(roastBatches.tenant_id, tenantId)))
  revalidatePath('/dashboard/roast-queue')
}

export async function adjustRoastedStock(id: string, delta: number) {
  const tenantId = await getTenantId()
  await db
    .update(roastedInventory)
    .set({ stock_kg: sql`stock_kg + ${delta}`, updated_at: new Date() })
    .where(and(eq(roastedInventory.id, id), eq(roastedInventory.tenant_id, tenantId)))
  revalidatePath('/dashboard/roasted-inventory')
  revalidatePath('/dashboard/packing')
}

// ── Types & calendar-calendar adapter ────────────────────────────────────────

/** Shape used by the roast calendar UI component */
export type RoastBatch = {
  id: string
  title: string
  beanOrigin: string
  roastLevel: string
  quantityKg: number
  status: string
  scheduledDate: string
  startTime: string | null
  notes: string | null
}

type CalendarBatchInput = {
  title: string
  beanOrigin: string
  roastLevel: string
  quantityKg: number
  status: string
  scheduledDate: string
  startTime: string
  notes: string
}

function toCalendarShape(b: Awaited<ReturnType<typeof getRoastBatches>>[number]): RoastBatch {
  return {
    id: b.id,
    title: b.batch_name ?? b.batch_number,
    beanOrigin: Array.isArray(b.lot_selections) && b.lot_selections.length > 0
      ? ((b.lot_selections as unknown as { bean_name?: string }[])[0].bean_name ?? '')
      : '',
    roastLevel: b.roast_level,
    quantityKg: Number(b.charge_kg),
    status: b.status,
    scheduledDate: b.scheduled_date ?? '',
    startTime: null,
    notes: b.notes ?? null,
  }
}

export async function getBatchesInRange(start: string, end: string): Promise<RoastBatch[]> {
  const tenantId = await getTenantId()
  const rows = await db
    .select()
    .from(roastBatches)
    .where(
      and(
        eq(roastBatches.tenant_id, tenantId),
        sql`${roastBatches.scheduled_date} >= ${start}`,
        sql`${roastBatches.scheduled_date} <= ${end}`,
      ),
    )
  return rows.map((b) => toCalendarShape({ ...b, order: null }))
}

export async function createBatch(input: CalendarBatchInput): Promise<void> {
  await createRoastBatch({
    batch_name: input.title,
    roast_level: input.roastLevel,
    charge_kg: input.quantityKg,
    status: input.status,
    scheduled_date: input.scheduledDate,
    notes: input.notes,
  })
}

export async function updateBatch(id: string, input: Partial<CalendarBatchInput>): Promise<void> {
  const tenantId = await getTenantId()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set: any = { updated_at: new Date() }
  if (input.title !== undefined) set.batch_name = input.title
  if (input.roastLevel !== undefined) set.roast_level = input.roastLevel
  if (input.quantityKg !== undefined) set.charge_kg = String(input.quantityKg)
  if (input.status !== undefined) set.status = input.status
  if (input.scheduledDate !== undefined) set.scheduled_date = input.scheduledDate
  if (input.notes !== undefined) set.notes = input.notes
  await db
    .update(roastBatches)
    .set(set)
    .where(and(eq(roastBatches.id, id), eq(roastBatches.tenant_id, tenantId)))
  revalidatePath('/dashboard/roast-queue')
}

export async function deleteBatch(id: string): Promise<void> {
  await deleteRoastBatch(id)
}
