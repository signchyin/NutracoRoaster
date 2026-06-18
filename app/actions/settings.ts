'use server'

import { db } from '@/lib/db'
import { tenants, tenantUsers, rolePermissions, user } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { getTenantId, newId } from '@/lib/db/helpers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

// ── Company / tenant profile ─────────────────────────────────────────────────

export async function getTenant() {
  const tenantId = await getTenantId()
  const rows = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1)
  if (rows.length > 0) return rows[0]

  // Auto-create on first access
  const session = await auth.api.getSession({ headers: await headers() })
  const name = session?.user?.name ?? ''
  await db.insert(tenants).values({ id: tenantId, name })
  return (await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1))[0]
}

export async function updateTenant(input: Partial<{
  name: string
  name_en: string
  tax_id: string
  address: string
  logo_url: string
  vat_rate: number
  billing_cutoff_day: number
  payment_terms: number
  invoice_prefix: string
  quotation_prefix: string
  receipt_prefix: string
  incentive_pct_revenue: number
  incentive_pct_margin: number
  default_target: number
  promptpay_id: string
}>) {
  const tenantId = await getTenantId()
  const set: Record<string, unknown> = { updated_at: new Date() }
  if (input.name !== undefined) set.name = input.name
  if (input.name_en !== undefined) set.name_en = input.name_en
  if (input.tax_id !== undefined) set.tax_id = input.tax_id
  if (input.address !== undefined) set.address = input.address
  if (input.logo_url !== undefined) set.logo_url = input.logo_url
  if (input.vat_rate !== undefined) set.vat_rate = String(input.vat_rate)
  if (input.billing_cutoff_day !== undefined) set.billing_cutoff_day = input.billing_cutoff_day
  if (input.payment_terms !== undefined) set.payment_terms = input.payment_terms
  if (input.invoice_prefix !== undefined) set.invoice_prefix = input.invoice_prefix
  if (input.quotation_prefix !== undefined) set.quotation_prefix = input.quotation_prefix
  if (input.receipt_prefix !== undefined) set.receipt_prefix = input.receipt_prefix
  if (input.incentive_pct_revenue !== undefined) set.incentive_pct_revenue = String(input.incentive_pct_revenue)
  if (input.incentive_pct_margin !== undefined) set.incentive_pct_margin = String(input.incentive_pct_margin)
  if (input.default_target !== undefined) set.default_target = String(input.default_target)
  if (input.promptpay_id !== undefined) set.promptpay_id = input.promptpay_id

  await db.update(tenants).set(set as typeof tenants.$inferInsert).where(eq(tenants.id, tenantId))
  revalidatePath('/dashboard/settings')
}

// ── Team members ─────────────────────────────────────────────────────────────

export async function getTeamMembers() {
  const tenantId = await getTenantId()
  return db
    .select()
    .from(tenantUsers)
    .where(eq(tenantUsers.tenant_id, tenantId))
    .orderBy(tenantUsers.created_at)
}

export async function addTeamMember(input: {
  username: string
  full_name: string
  nickname?: string
  phone?: string
  email?: string
  password: string
  role: 'sales' | 'operations' | 'finance' | 'viewer'
}) {
  const tenantId = await getTenantId()

  // Create Better Auth account
  const result = await auth.api.signUpEmail({
    body: {
      name: input.full_name,
      email: input.email ?? `${input.username}@tenant-${tenantId}.local`,
      password: input.password,
    },
  })

  const userId = result?.user?.id
  if (!userId) throw new Error('Failed to create user')

  await db.insert(tenantUsers).values({
    id: userId,
    tenant_id: tenantId,
    username: input.username,
    full_name: input.full_name,
    nickname: input.nickname ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    role: input.role,
    is_active: true,
  })

  revalidatePath('/dashboard/settings')
  return { id: userId }
}

export async function updateTeamMember(id: string, input: Partial<{
  full_name: string
  nickname: string
  phone: string
  email: string
  role: 'sales' | 'operations' | 'finance' | 'viewer'
  is_active: boolean
}>) {
  const tenantId = await getTenantId()
  await db
    .update(tenantUsers)
    .set({ ...input, updated_at: new Date() })
    .where(and(eq(tenantUsers.id, id), eq(tenantUsers.tenant_id, tenantId)))
  revalidatePath('/dashboard/settings')
}

export async function toggleTeamMemberActive(id: string, is_active: boolean) {
  const tenantId = await getTenantId()
  await db
    .update(tenantUsers)
    .set({ is_active, updated_at: new Date() })
    .where(and(eq(tenantUsers.id, id), eq(tenantUsers.tenant_id, tenantId)))
  revalidatePath('/dashboard/settings')
}

export async function deleteTeamMember(id: string) {
  const tenantId = await getTenantId()
  await db
    .delete(tenantUsers)
    .where(and(eq(tenantUsers.id, id), eq(tenantUsers.tenant_id, tenantId)))
  revalidatePath('/dashboard/settings')
}

// ── Role permissions ──────────────────────────────────────────────────────────

export async function getRolePermissions() {
  const tenantId = await getTenantId()
  return db
    .select()
    .from(rolePermissions)
    .where(eq(rolePermissions.tenant_id, tenantId))
}

export async function upsertRolePermission(
  role: 'sales' | 'operations' | 'finance' | 'viewer',
  page: string,
  allowed: boolean,
) {
  const tenantId = await getTenantId()
  const existing = await db
    .select()
    .from(rolePermissions)
    .where(and(eq(rolePermissions.tenant_id, tenantId), eq(rolePermissions.role, role)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(rolePermissions)
      .set({ [page]: allowed, updated_at: new Date() })
      .where(eq(rolePermissions.id, existing[0].id))
  } else {
    await db.insert(rolePermissions).values({
      id: newId(),
      tenant_id: tenantId,
      role,
      [page]: allowed,
    })
  }
  revalidatePath('/dashboard/settings')
}
