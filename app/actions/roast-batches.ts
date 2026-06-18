'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { roastBatch } from '@/lib/db/schema'
import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export type RoastBatch = typeof roastBatch.$inferSelect

export async function getBatchesInRange(start: string, end: string) {
  const userId = await getUserId()
  return db
    .select()
    .from(roastBatch)
    .where(
      and(
        eq(roastBatch.userId, userId),
        gte(roastBatch.scheduledDate, start),
        lte(roastBatch.scheduledDate, end),
      ),
    )
    .orderBy(asc(roastBatch.scheduledDate), asc(roastBatch.startTime))
}

export async function createBatch(input: {
  title: string
  beanOrigin: string
  roastLevel: string
  quantityKg: number
  status: string
  scheduledDate: string
  startTime: string
  notes: string
}) {
  const userId = await getUserId()
  await db.insert(roastBatch).values({
    userId,
    title: input.title,
    beanOrigin: input.beanOrigin,
    roastLevel: input.roastLevel,
    quantityKg: input.quantityKg,
    status: input.status,
    scheduledDate: input.scheduledDate,
    startTime: input.startTime || null,
    notes: input.notes || null,
  })
  revalidatePath('/dashboard')
}

export async function updateBatch(
  id: number,
  input: {
    title: string
    beanOrigin: string
    roastLevel: string
    quantityKg: number
    status: string
    scheduledDate: string
    startTime: string
    notes: string
  },
) {
  const userId = await getUserId()
  await db
    .update(roastBatch)
    .set({
      title: input.title,
      beanOrigin: input.beanOrigin,
      roastLevel: input.roastLevel,
      quantityKg: input.quantityKg,
      status: input.status,
      scheduledDate: input.scheduledDate,
      startTime: input.startTime || null,
      notes: input.notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(roastBatch.id, id), eq(roastBatch.userId, userId)))
  revalidatePath('/dashboard')
}

export async function deleteBatch(id: number) {
  const userId = await getUserId()
  await db
    .delete(roastBatch)
    .where(and(eq(roastBatch.id, id), eq(roastBatch.userId, userId)))
  revalidatePath('/dashboard')
}
