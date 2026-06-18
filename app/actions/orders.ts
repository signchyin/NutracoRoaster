'use server'

import { db } from '@/lib/db'
import { orders, orderItems, customers } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { getTenantId, newId, toDateString, toBillingPeriod } from '@/lib/db/helpers'
import { revalidatePath } from 'next/cache'

export async function getOrders() {
  const tenantId = await getTenantId()
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.tenant_id, tenantId))
    .orderBy(desc(orders.created_at))

  // Attach customer names
  const customerIds = [...new Set(rows.map((r) => r.customer_id))]
  let customerMap: Record<string, { name: string; type: string }> = {}
  if (customerIds.length > 0) {
    const custs = await db
      .select({ id: customers.id, name: customers.name, type: customers.type })
      .from(customers)
      .where(and(eq(customers.tenant_id, tenantId)))
    customerMap = Object.fromEntries(custs.map((c) => [c.id, { name: c.name, type: c.type }]))
  }

  // Attach items
  const orderIds = rows.map((r) => r.id)
  let itemMap: Record<string, typeof orderItems.$inferSelect[]> = {}
  if (orderIds.length > 0) {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.tenant_id, tenantId))
    for (const item of items) {
      if (!itemMap[item.order_id]) itemMap[item.order_id] = []
      itemMap[item.order_id].push(item)
    }
  }

  return rows.map((o) => ({
    ...o,
    customer: customerMap[o.customer_id] ?? null,
    items: itemMap[o.id] ?? [],
  }))
}

export async function getOrderById(id: string) {
  const tenantId = await getTenantId()
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.tenant_id, tenantId)))
    .limit(1)
  if (!order) return null

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, order.customer_id))
    .limit(1)

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.order_id, id))

  return { ...order, customer: customer ?? null, items }
}

export type CreateOrderInput = {
  customer_id: string
  order_date: string
  billing_period: string
  notes?: string
  items: Array<{
    product_id: string
    product_name_snapshot: string
    qty: number
    unit: string
    kg_per_unit: number
    selling_price_per_unit: number
    cost_per_kg_snapshot: number
  }>
  vat_rate?: number
}

export async function createOrder(input: CreateOrderInput) {
  const tenantId = await getTenantId()

  // Generate order number
  const countRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.tenant_id, tenantId))
  const count = Number(countRes[0]?.count ?? 0) + 1
  const year = new Date().getFullYear()
  const order_number = `ORD-${year}-${String(count).padStart(4, '0')}`

  const vat_rate = input.vat_rate ?? 0.07
  const id = newId()

  // Compute line totals
  const itemRows = input.items.map((item) => {
    const total_kg = item.qty * item.kg_per_unit
    const line_total = item.qty * item.selling_price_per_unit
    const total_cost = total_kg * item.cost_per_kg_snapshot
    const profit = line_total - total_cost
    const profit_margin_pct = line_total > 0 ? profit / line_total : 0
    return {
      id: newId(),
      tenant_id: tenantId,
      order_id: id,
      product_id: item.product_id,
      product_name_snapshot: item.product_name_snapshot,
      qty: String(item.qty),
      unit: item.unit,
      kg_per_unit: String(item.kg_per_unit),
      total_kg: String(total_kg),
      selling_price_per_unit: String(item.selling_price_per_unit),
      line_total: String(line_total),
      cost_per_kg_snapshot: String(item.cost_per_kg_snapshot),
      total_cost: String(total_cost),
      profit: String(profit),
      profit_margin_pct: String(profit_margin_pct),
    }
  })

  const subtotal = itemRows.reduce((s, r) => s + Number(r.line_total), 0)
  const vat_amt = Math.round(subtotal * vat_rate * 100) / 100
  const total_revenue = subtotal + vat_amt
  const total_cost = itemRows.reduce((s, r) => s + Number(r.total_cost), 0)
  const profit = total_revenue - total_cost
  const profit_margin_pct = total_revenue > 0 ? profit / total_revenue : 0

  await db.insert(orders).values({
    id,
    tenant_id: tenantId,
    order_number,
    customer_id: input.customer_id,
    status: 'confirmed',
    order_date: input.order_date || toDateString(),
    billing_period: input.billing_period || toBillingPeriod(),
    subtotal: String(subtotal),
    discount_amt: '0',
    vat_rate: String(vat_rate),
    vat_amt: String(vat_amt),
    total_revenue: String(total_revenue),
    total_cost: String(total_cost),
    profit: String(profit),
    profit_margin_pct: String(profit_margin_pct),
    notes: input.notes ?? null,
  })

  if (itemRows.length > 0) {
    await db.insert(orderItems).values(itemRows)
  }

  revalidatePath('/dashboard/orders')
  return { id, order_number }
}

export async function updateOrderStatus(id: string, status: string) {
  const tenantId = await getTenantId()
  await db
    .update(orders)
    .set({ status: status as typeof orders.$inferInsert['status'], updated_at: new Date() })
    .where(and(eq(orders.id, id), eq(orders.tenant_id, tenantId)))
  revalidatePath('/dashboard/orders')
  revalidatePath('/dashboard/roast-queue')
  revalidatePath('/dashboard/packing')
}

export async function cancelOrder(id: string) {
  return updateOrderStatus(id, 'cancelled')
}
