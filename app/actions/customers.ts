'use server'

import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { and, asc, eq, ilike, or } from 'drizzle-orm'
import { getTenantId, newId } from '@/lib/db/helpers'
import { revalidatePath } from 'next/cache'

export async function getCustomers(search?: string, type?: 'b2b' | 'b2c') {
  const tenantId = await getTenantId()
  const conditions = [eq(customers.tenant_id, tenantId)]
  if (type) conditions.push(eq(customers.type, type))
  if (search) {
    conditions.push(
      or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.contact_person, `%${search}%`),
        ilike(customers.phone, `%${search}%`),
      )!,
    )
  }
  return db
    .select()
    .from(customers)
    .where(and(...conditions))
    .orderBy(asc(customers.created_at))
}

export async function getCustomerById(id: string) {
  const tenantId = await getTenantId()
  const [c] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.tenant_id, tenantId)))
    .limit(1)
  return c ?? null
}

export type CustomerInput = {
  name: string
  name_en?: string
  type: 'b2b' | 'b2c'
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  tax_id?: string
  zone?: string
  notes?: string
}

export async function createCustomer(input: CustomerInput) {
  const tenantId = await getTenantId()
  const countRes = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.tenant_id, tenantId))
  const code = `CUST-${String(countRes.length + 1).padStart(3, '0')}`
  const id = newId()
  await db.insert(customers).values({
    id,
    tenant_id: tenantId,
    customer_code: code,
    name: input.name,
    name_en: input.name_en ?? null,
    type: input.type,
    contact_person: input.contact_person ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
    tax_id: input.tax_id ?? null,
    zone: input.zone ?? null,
    notes: input.notes ?? null,
  })
  revalidatePath('/dashboard/customers')
  return id
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const tenantId = await getTenantId()
  await db
    .update(customers)
    .set({ ...input, updated_at: new Date() })
    .where(and(eq(customers.id, id), eq(customers.tenant_id, tenantId)))
  revalidatePath('/dashboard/customers')
}
