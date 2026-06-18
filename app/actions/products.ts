'use server'

import { db } from '@/lib/db'
import { products, roastedInventory } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { getTenantId, newId } from '@/lib/db/helpers'
import { revalidatePath } from 'next/cache'

export type BlendIngredient = {
  origin: string
  percentage: number
  roast_level: string
}

export async function getProducts() {
  const tenantId = await getTenantId()

  const prods = await db
    .select()
    .from(products)
    .where(and(eq(products.tenant_id, tenantId), eq(products.is_active, true)))
    .orderBy(asc(products.created_at))

  // Attach roasted stock from roasted_inventory
  const roastedRows = await db
    .select()
    .from(roastedInventory)
    .where(eq(roastedInventory.tenant_id, tenantId))

  return prods.map((p) => {
    const recipe = (p.blend_recipe ?? []) as BlendIngredient[]
    // Sum stock for each component in the blend
    let minAvailableKg = Infinity
    if (recipe.length > 0) {
      for (const ing of recipe) {
        const row = roastedRows.find(
          (r) => r.origin === ing.origin && r.roast_level === ing.roast_level,
        )
        const stockKg = row ? Number(row.stock_kg) : 0
        const needed = ing.percentage / 100
        if (needed > 0) {
          const possible = stockKg / needed
          if (possible < minAvailableKg) minAvailableKg = possible
        }
      }
      if (minAvailableKg === Infinity) minAvailableKg = 0
    } else {
      minAvailableKg = Number(p.roasted_stock_kg)
    }
    return { ...p, roasted_stock_kg: String(Math.max(0, minAvailableKg)) }
  })
}

export type ProductInput = {
  name: string
  name_en?: string
  sku?: string
  description?: string
  blend_recipe?: BlendIngredient[]
  roast_level?: string
  selling_price_per_kg: number
  cost_per_kg: number
  default_unit?: string
  kg_per_unit?: number
}

export async function createProduct(input: ProductInput) {
  const tenantId = await getTenantId()
  const id = newId()
  await db.insert(products).values({
    id,
    tenant_id: tenantId,
    sku: input.sku ?? null,
    name: input.name,
    name_en: input.name_en ?? null,
    description: input.description ?? null,
    blend_recipe: input.blend_recipe ?? null,
    roast_level: input.roast_level ?? null,
    selling_price_per_kg: String(input.selling_price_per_kg),
    cost_per_kg: String(input.cost_per_kg),
    default_unit: input.default_unit ?? 'kg',
    kg_per_unit: String(input.kg_per_unit ?? 1),
  })
  revalidatePath('/dashboard/products')
  return id
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const tenantId = await getTenantId()
  const updateData: Record<string, unknown> = { updated_at: new Date() }
  if (input.name !== undefined) updateData.name = input.name
  if (input.name_en !== undefined) updateData.name_en = input.name_en
  if (input.sku !== undefined) updateData.sku = input.sku
  if (input.description !== undefined) updateData.description = input.description
  if (input.blend_recipe !== undefined) updateData.blend_recipe = input.blend_recipe
  if (input.roast_level !== undefined) updateData.roast_level = input.roast_level
  if (input.selling_price_per_kg !== undefined) updateData.selling_price_per_kg = String(input.selling_price_per_kg)
  if (input.cost_per_kg !== undefined) updateData.cost_per_kg = String(input.cost_per_kg)
  if (input.default_unit !== undefined) updateData.default_unit = input.default_unit
  if (input.kg_per_unit !== undefined) updateData.kg_per_unit = String(input.kg_per_unit)
  await db
    .update(products)
    .set(updateData)
    .where(and(eq(products.id, id), eq(products.tenant_id, tenantId)))
  revalidatePath('/dashboard/products')
}

export async function archiveProduct(id: string) {
  const tenantId = await getTenantId()
  await db
    .update(products)
    .set({ is_active: false, updated_at: new Date() })
    .where(and(eq(products.id, id), eq(products.tenant_id, tenantId)))
  revalidatePath('/dashboard/products')
}
