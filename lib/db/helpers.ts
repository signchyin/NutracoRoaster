import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/** Returns the current user's tenant_id (= their own user id for owners). */
export async function getTenantId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

/** Generates a UUID-like ID using crypto. */
export function newId(): string {
  return crypto.randomUUID()
}

/** Formats a date as YYYY-MM-DD. */
export function toDateString(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}

/** Formats a date as YYYY-MM (billing period). */
export function toBillingPeriod(d: Date = new Date()): string {
  return d.toISOString().slice(0, 7)
}

/** Generates an auto-increment-style number string padded to 4 digits.
 *  Example: 1 → "0001" */
export function padNumber(n: number, digits = 4): string {
  return String(n).padStart(digits, '0')
}
