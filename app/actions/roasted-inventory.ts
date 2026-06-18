'use server'

import { db } from '@/lib/db'
import { roastedInventory } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { getTenantId, newId } from '@/lib/db/helpers'
import { revalidatePath } from 'next/cache'

export async function getRoastedInventory() {
  const tenantId = await getTenantId()
  return db
    .select()
    .from(roastedInventory)
    .where(eq(roastedInventory.tenant_id, tenantId))
    .orderBy(roastedInventory.origin, roastedInventory.roast_level)
}

export async function adjustRoastedStock(id: string, delta_kg: number, reason?: string) {
  const tenantId = await getTenantId()
  await db
    .update(roastedInventory)
    .set({
      stock_kg: sql`${roastedInventory.stock_kg} + ${delta_kg}`,
      updated_at: new Date(),
    })
    .where(and(eq(roastedInventory.id, id), eq(roastedInventory.tenant_id, tenantId)))
  revalidatePath('/dashboard/roast-done')
  revalidatePath('/dashboard/packing')
}

export async function upsertRoastedStock(origin: string, roast_level: string, delta_kg: number) {
  const tenantId = await getTenantId()
  const existing = await db
    .select()
    .from(roastedInventory)
    .where(
      and(
        eq(roastedInventory.tenant_id, tenantId),
        eq(roastedInventory.origin, origin),
        eq(roastedInventory.roast_level, roast_level),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(roastedInventory)
      .set({
        stock_kg: sql`${roastedInventory.stock_kg} + ${delta_kg}`,
        updated_at: new Date(),
      })
      .where(eq(roastedInventory.id, existing[0].id))
  } else {
    await db.insert(roastedInventory).values({
      id: newId(),
      tenant_id: tenantId,
      origin,
      roast_level,
      stock_kg: String(Math.max(0, delta_kg)),
    })
  }
  revalidatePath('/dashboard/roast-done')
}

export async function deductRoastedStock(origin: string, roast_level: string, kg: number) {
  const tenantId = await getTenantId()
  await db
    .update(roastedInventory)
    .set({
      stock_kg: sql`${roastedInventory.stock_kg} - ${kg}`,
      updated_at: new Date(),
    })
    .where(
      and(
        eq(roastedInventory.tenant_id, tenantId),
        eq(roastedInventory.origin, origin),
        eq(roastedInventory.roast_level, roast_level),
      ),
    )
  revalidatePath('/dashboard/roast-done')
  revalidatePath('/dashboard/packing')
}
