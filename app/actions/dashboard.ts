'use server'

import { db } from '@/lib/db'
import { orders, orderItems, customers, products } from '@/lib/db/schema'
import { and, eq, gte, lte, sql, desc } from 'drizzle-orm'
import { getTenantId } from '@/lib/db/helpers'

export type DashboardPeriod = 'month' | 'quarter' | 'year' | 'all' | 'custom'

function getDateRange(period: DashboardPeriod, customStart?: string, customEnd?: string) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  if (period === 'month') {
    return {
      start: new Date(y, m, 1).toISOString().slice(0, 10),
      end: new Date(y, m + 1, 0).toISOString().slice(0, 10),
    }
  }
  if (period === 'quarter') {
    return {
      start: new Date(y, m - 2, 1).toISOString().slice(0, 10),
      end: new Date(y, m + 1, 0).toISOString().slice(0, 10),
    }
  }
  if (period === 'year') {
    return {
      start: new Date(y, 0, 1).toISOString().slice(0, 10),
      end: new Date(y, 11, 31).toISOString().slice(0, 10),
    }
  }
  if (period === 'custom' && customStart && customEnd) {
    return { start: customStart, end: customEnd }
  }
  // 'all' — no date filter
  return null
}

export async function getDashboardOverview(
  period: DashboardPeriod = 'month',
  customStart?: string,
  customEnd?: string,
) {
  const tenantId = await getTenantId()
  const range = getDateRange(period, customStart, customEnd)

  const conditions = [
    eq(orders.tenant_id, tenantId),
    ...(range
      ? [gte(orders.order_date, range.start), lte(orders.order_date, range.end)]
      : []),
  ]

  // KPIs
  const kpiRows = await db
    .select({
      total_revenue: sql<number>`coalesce(sum(${orders.total_revenue}),0)`,
      total_cost: sql<number>`coalesce(sum(${orders.total_cost}),0)`,
      total_profit: sql<number>`coalesce(sum(${orders.profit}),0)`,
      order_count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(...conditions))

  const kpi = kpiRows[0] ?? { total_revenue: 0, total_cost: 0, total_profit: 0, order_count: 0 }
  const gross_margin_pct =
    Number(kpi.total_revenue) > 0
      ? (Number(kpi.total_profit) / Number(kpi.total_revenue)) * 100
      : 0

  // Monthly revenue + cost (last 12 billing periods)
  const monthly = await db
    .select({
      period: orders.billing_period,
      revenue: sql<number>`coalesce(sum(${orders.total_revenue}),0)`,
      cost: sql<number>`coalesce(sum(${orders.total_cost}),0)`,
      profit: sql<number>`coalesce(sum(${orders.profit}),0)`,
    })
    .from(orders)
    .where(eq(orders.tenant_id, tenantId))
    .groupBy(orders.billing_period)
    .orderBy(orders.billing_period)
    .limit(12)

  // B2B vs B2C split
  const channelSplit = await db
    .select({
      type: customers.type,
      revenue: sql<number>`coalesce(sum(${orders.total_revenue}),0)`,
      profit: sql<number>`coalesce(sum(${orders.profit}),0)`,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customer_id, customers.id))
    .where(and(...conditions))
    .groupBy(customers.type)

  // Zone breakdown
  const zones = await db
    .select({
      zone: customers.zone,
      revenue: sql<number>`coalesce(sum(${orders.total_revenue}),0)`,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customer_id, customers.id))
    .where(and(...conditions))
    .groupBy(customers.zone)

  // Top products
  const topProducts = await db
    .select({
      product_name: orderItems.product_name_snapshot,
      total_kg: sql<number>`coalesce(sum(${orderItems.total_kg}),0)`,
      total_revenue: sql<number>`coalesce(sum(${orderItems.line_total}),0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.order_id, orders.id))
    .where(and(eq(orders.tenant_id, tenantId), ...(range ? [gte(orders.order_date, range.start), lte(orders.order_date, range.end)] : [])))
    .groupBy(orderItems.product_name_snapshot)
    .orderBy(desc(sql`sum(${orderItems.line_total})`))
    .limit(5)

  // Key customers
  const topCustomers = await db
    .select({
      customer_name: customers.name,
      customer_type: customers.type,
      total_revenue: sql<number>`coalesce(sum(${orders.total_revenue}),0)`,
      total_profit: sql<number>`coalesce(sum(${orders.profit}),0)`,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customer_id, customers.id))
    .where(and(...conditions))
    .groupBy(customers.id, customers.name, customers.type)
    .orderBy(desc(sql`sum(${orders.total_revenue})`))
    .limit(5)

  return {
    kpi: {
      total_revenue: Number(kpi.total_revenue),
      total_cost: Number(kpi.total_cost),
      total_profit: Number(kpi.total_profit),
      gross_margin_pct,
      order_count: Number(kpi.order_count),
    },
    monthly: monthly.map((r) => ({
      period: r.period,
      revenue: Number(r.revenue),
      cost: Number(r.cost),
      profit: Number(r.profit),
      margin_pct: Number(r.revenue) > 0 ? (Number(r.profit) / Number(r.revenue)) * 100 : 0,
    })),
    channelSplit: channelSplit.map((r) => ({
      type: r.type,
      revenue: Number(r.revenue),
      profit: Number(r.profit),
      margin_pct: Number(r.revenue) > 0 ? (Number(r.profit) / Number(r.revenue)) * 100 : 0,
    })),
    zones: zones.map((r) => ({ zone: r.zone ?? 'ไม่ระบุ', revenue: Number(r.revenue) })),
    topProducts: topProducts.map((r) => ({
      name: r.product_name,
      total_kg: Number(r.total_kg),
      total_revenue: Number(r.total_revenue),
    })),
    topCustomers: topCustomers.map((r) => ({
      name: r.customer_name,
      type: r.customer_type,
      revenue: Number(r.total_revenue),
      profit: Number(r.total_profit),
      margin_pct: Number(r.total_revenue) > 0 ? (Number(r.total_profit) / Number(r.total_revenue)) * 100 : 0,
    })),
  }
}
