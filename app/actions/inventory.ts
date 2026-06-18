'use server'

import { db } from '@/lib/db'
import { greenBeanLots } from '@/lib/db/schema'
import { and, asc, eq, sql } from 'drizzle-orm'
import { getTenantId, newId } from '@/lib/db/helpers'
import { revalidatePath } from 'next/cache'

export async function getGreenBeanLots() {
  const tenantId = await getTenantId()
  return db
    .select()
    .from(greenBeanLots)
    .where(and(eq(greenBeanLots.tenant_id, tenantId), eq(greenBeanLots.status, 'active')))
    .orderBy(asc(greenBeanLots.created_at))
}

export type GreenBeanLotInput = {
  lot_id?: string
  supplier_lot_number?: string
  bean_name: string
  origin_country: string
  crop_year?: string
  supplier_name?: string
  supplier_contact?: string
  supplier_phone?: string
  receiving_date?: string
  bag_count?: number
  invoice_cost_per_kg?: number
  cost_per_kg: number
  stock_kg: number
  low_stock_threshold_kg?: number
  notes?: string
}

export async function addGreenBeanLot(input: GreenBeanLotInput) {
  const tenantId = await getTenantId()
  const id = newId()
  await db.insert(greenBeanLots).values({
    id,
    tenant_id: tenantId,
    lot_id: input.lot_id ?? null,
    supplier_lot_number: input.supplier_lot_number ?? null,
    bean_name: input.bean_name,
    origin_country: input.origin_country,
    crop_year: input.crop_year ?? null,
    supplier_name: input.supplier_name ?? null,
    supplier_contact: input.supplier_contact ?? null,
    supplier_phone: input.supplier_phone ?? null,
    receiving_date: input.receiving_date ?? null,
    bag_count: input.bag_count ?? null,
    invoice_cost_per_kg: input.invoice_cost_per_kg != null ? String(input.invoice_cost_per_kg) : null,
    cost_per_kg: String(input.cost_per_kg),
    stock_kg: String(input.stock_kg),
    low_stock_threshold_kg: String(input.low_stock_threshold_kg ?? 20),
    notes: input.notes ?? null,
    status: 'active',
  })
  revalidatePath('/dashboard/inventory')
  return id
}

export async function updateGreenBeanLot(id: string, input: Partial<GreenBeanLotInput>) {
  const tenantId = await getTenantId()
  const updateData: Record<string, unknown> = { updated_at: new Date() }
  if (input.lot_id !== undefined) updateData.lot_id = input.lot_id
  if (input.supplier_lot_number !== undefined) updateData.supplier_lot_number = input.supplier_lot_number
  if (input.bean_name !== undefined) updateData.bean_name = input.bean_name
  if (input.origin_country !== undefined) updateData.origin_country = input.origin_country
  if (input.crop_year !== undefined) updateData.crop_year = input.crop_year
  if (input.supplier_name !== undefined) updateData.supplier_name = input.supplier_name
  if (input.supplier_contact !== undefined) updateData.supplier_contact = input.supplier_contact
  if (input.supplier_phone !== undefined) updateData.supplier_phone = input.supplier_phone
  if (input.receiving_date !== undefined) updateData.receiving_date = input.receiving_date
  if (input.bag_count !== undefined) updateData.bag_count = input.bag_count
  if (input.invoice_cost_per_kg !== undefined) updateData.invoice_cost_per_kg = String(input.invoice_cost_per_kg)
  if (input.cost_per_kg !== undefined) updateData.cost_per_kg = String(input.cost_per_kg)
  if (input.stock_kg !== undefined) updateData.stock_kg = String(input.stock_kg)
  if (input.low_stock_threshold_kg !== undefined) updateData.low_stock_threshold_kg = String(input.low_stock_threshold_kg)
  if (input.notes !== undefined) updateData.notes = input.notes

  await db
    .update(greenBeanLots)
    .set(updateData)
    .where(and(eq(greenBeanLots.id, id), eq(greenBeanLots.tenant_id, tenantId)))
  revalidatePath('/dashboard/inventory')
}

export async function adjustStock(id: string, qty: number, sign: 'increase' | 'decrease') {
  const tenantId = await getTenantId()
  const delta = sign === 'increase' ? qty : -qty
  await db
    .update(greenBeanLots)
    .set({
      stock_kg: sql`stock_kg + ${delta}`,
      updated_at: new Date(),
    })
    .where(and(eq(greenBeanLots.id, id), eq(greenBeanLots.tenant_id, tenantId)))
  revalidatePath('/dashboard/inventory')
}

export async function deleteGreenBeanLot(id: string) {
  const tenantId = await getTenantId()
  await db
    .delete(greenBeanLots)
    .where(and(eq(greenBeanLots.id, id), eq(greenBeanLots.tenant_id, tenantId)))
  revalidatePath('/dashboard/inventory')
}
