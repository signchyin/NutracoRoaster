import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// Better Auth required tables — camelCase column names to match BA defaults
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'confirmed',
  'in_production',
  'ready',
  'shipped',
  'completed',
  'cancelled',
])

export const customerTypeEnum = pgEnum('customer_type', ['b2b', 'b2c'])

export const batchStatusEnum = pgEnum('batch_status', [
  'queued',
  'roasting',
  'cooling',
  'packing',
  'ready',
  'complete',
])

export const calendarCategoryEnum = pgEnum('calendar_category', [
  'b2b',
  'b2c',
  'roast',
  'sourcing',
  'content',
  'admin',
])

export const userRoleEnum = pgEnum('user_role', [
  'owner',
  'sales',
  'operations',
  'finance',
  'viewer',
])

// ---------------------------------------------------------------------------
// App tables — snake_case column names (match live API)
// ---------------------------------------------------------------------------

/** Tenant / company profile for a roastery */
export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(), // userId of the owner
  name: text('name').notNull().default(''),
  name_en: text('name_en'),
  tax_id: text('tax_id'),
  address: text('address'),
  logo_url: text('logo_url'),
  // system config
  vat_rate: numeric('vat_rate', { precision: 5, scale: 4 }).notNull().default('0.07'),
  billing_cutoff_day: integer('billing_cutoff_day').notNull().default(25),
  payment_terms: integer('payment_terms').notNull().default(30),
  invoice_prefix: text('invoice_prefix').notNull().default('INV'),
  quotation_prefix: text('quotation_prefix').notNull().default('QT'),
  receipt_prefix: text('receipt_prefix').notNull().default('REC'),
  incentive_pct_revenue: numeric('incentive_pct_revenue', { precision: 5, scale: 4 }).default('0.03'),
  incentive_pct_margin: numeric('incentive_pct_margin', { precision: 5, scale: 4 }).default('0.10'),
  default_target: numeric('default_target', { precision: 12, scale: 2 }).default('100000'),
  promptpay_id: text('promptpay_id'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Team members (sub-accounts) belonging to a tenant */
export const tenantUsers = pgTable('tenant_users', {
  id: text('id').primaryKey(), // same as user.id
  tenant_id: text('tenant_id').notNull(), // owner's user id
  username: text('username').notNull(),
  full_name: text('full_name').notNull(),
  nickname: text('nickname'),
  phone: text('phone'),
  email: text('email'),
  role: userRoleEnum('role').notNull().default('viewer'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Per-role page permission overrides */
export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  role: userRoleEnum('role').notNull(),
  // pages — true = accessible
  dashboard: boolean('dashboard').notNull().default(true),
  orders: boolean('orders').notNull().default(false),
  customers: boolean('customers').notNull().default(false),
  incentives: boolean('incentives').notNull().default(false),
  roast_queue: boolean('roast_queue').notNull().default(false),
  products: boolean('products').notNull().default(false),
  inventory: boolean('inventory').notNull().default(false),
  roasted_inventory: boolean('roasted_inventory').notNull().default(false),
  invoices: boolean('invoices').notNull().default(false),
  calendar: boolean('calendar').notNull().default(true),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Customers (B2B and B2C) */
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  customer_code: text('customer_code'),
  name: text('name').notNull(),
  name_en: text('name_en'),
  type: customerTypeEnum('type').notNull().default('b2b'),
  contact_person: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  tax_id: text('tax_id'),
  default_discount_pct: numeric('default_discount_pct', { precision: 5, scale: 4 }).notNull().default('0'),
  assigned_sales_user_id: text('assigned_sales_user_id'),
  zone: text('zone'),
  first_order_date: date('first_order_date'),
  notes: text('notes'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Orders */
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  order_number: text('order_number').notNull(),
  customer_id: text('customer_id').notNull(),
  status: orderStatusEnum('status').notNull().default('draft'),
  sales_user_id: text('sales_user_id'),
  order_date: date('order_date').notNull(),
  delivery_date: date('delivery_date'),
  billing_period: text('billing_period').notNull(), // YYYY-MM
  subtotal: numeric('subtotal', { precision: 14, scale: 2 }).notNull().default('0'),
  discount_amt: numeric('discount_amt', { precision: 14, scale: 2 }).notNull().default('0'),
  vat_rate: numeric('vat_rate', { precision: 5, scale: 4 }).notNull().default('0.07'),
  vat_amt: numeric('vat_amt', { precision: 14, scale: 2 }).notNull().default('0'),
  total_revenue: numeric('total_revenue', { precision: 14, scale: 2 }).notNull().default('0'),
  total_cost: numeric('total_cost', { precision: 14, scale: 2 }).notNull().default('0'),
  profit: numeric('profit', { precision: 14, scale: 2 }).notNull().default('0'),
  profit_margin_pct: numeric('profit_margin_pct', { precision: 7, scale: 4 }).notNull().default('0'),
  payment_method: text('payment_method'),
  paid_at: timestamp('paid_at'),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Order line items */
export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  order_id: text('order_id').notNull(),
  product_id: text('product_id').notNull(),
  product_name_snapshot: text('product_name_snapshot').notNull(),
  qty: numeric('qty', { precision: 10, scale: 3 }).notNull(),
  unit: text('unit').notNull().default('kg'), // kg | gram | bag | sachet | custom
  kg_per_unit: numeric('kg_per_unit', { precision: 10, scale: 4 }).notNull().default('1'),
  total_kg: numeric('total_kg', { precision: 10, scale: 3 }).notNull(),
  selling_price_per_unit: numeric('selling_price_per_unit', { precision: 12, scale: 2 }).notNull(),
  line_total: numeric('line_total', { precision: 14, scale: 2 }).notNull(),
  cost_per_kg_snapshot: numeric('cost_per_kg_snapshot', { precision: 12, scale: 2 }).notNull().default('0'),
  total_cost: numeric('total_cost', { precision: 14, scale: 2 }).notNull().default('0'),
  profit: numeric('profit', { precision: 14, scale: 2 }).notNull().default('0'),
  profit_margin_pct: numeric('profit_margin_pct', { precision: 7, scale: 4 }).notNull().default('0'),
})

/** Products (roasted coffee SKUs with blend recipes) */
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  sku: text('sku'),
  name: text('name').notNull(),
  name_en: text('name_en'),
  description: text('description'),
  image_url: text('image_url'),
  // blend_recipe: [{origin, percentage, roast_level}]
  blend_recipe: jsonb('blend_recipe'),
  roast_level: text('roast_level'),
  selling_price_per_kg: numeric('selling_price_per_kg', { precision: 12, scale: 2 }).notNull().default('0'),
  cost_per_kg: numeric('cost_per_kg', { precision: 12, scale: 2 }).notNull().default('0'),
  price_tiers: jsonb('price_tiers'), // [{min_kg, price_per_kg}]
  default_unit: text('default_unit').notNull().default('kg'),
  kg_per_unit: numeric('kg_per_unit', { precision: 10, scale: 4 }).notNull().default('1'),
  is_active: boolean('is_active').notNull().default(true),
  roasted_stock_kg: numeric('roasted_stock_kg', { precision: 12, scale: 3 }).notNull().default('0'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Green bean inventory (LOT tracking) */
export const greenBeanLots = pgTable('green_bean_lots', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  lot_id: text('lot_id'), // user-assigned LOT ID e.g. GB-CBS-2602-BRS
  supplier_lot_number: text('supplier_lot_number'),
  bean_name: text('bean_name').notNull(),
  origin_country: text('origin_country').notNull(),
  crop_year: text('crop_year'),
  supplier_name: text('supplier_name'),
  supplier_contact: text('supplier_contact'),
  supplier_phone: text('supplier_phone'),
  receiving_date: date('receiving_date'),
  bag_count: integer('bag_count'),
  invoice_cost_per_kg: numeric('invoice_cost_per_kg', { precision: 12, scale: 2 }),
  cost_per_kg: numeric('cost_per_kg', { precision: 12, scale: 2 }).notNull().default('0'),
  stock_kg: numeric('stock_kg', { precision: 12, scale: 3 }).notNull().default('0'),
  low_stock_threshold_kg: numeric('low_stock_threshold_kg', { precision: 12, scale: 3 }).notNull().default('20'),
  status: text('status').notNull().default('active'), // active | depleted | archived
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Roasted coffee virtual inventory
 *  Keyed by (tenant_id, origin, roast_level) — one row per unique combination.
 *  Updated automatically by roast batch completion. */
export const roastedInventory = pgTable('roasted_inventory', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  origin: text('origin').notNull(), // e.g. "(Arabica) Laos Bolaven"
  roast_level: text('roast_level').notNull(), // e.g. "คั่วอ่อน"
  stock_kg: numeric('stock_kg', { precision: 12, scale: 3 }).notNull().default('0'),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Roast batches — the kanban cards in the roast queue */
export const roastBatches = pgTable('roast_batches', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  batch_number: text('batch_number').notNull(), // e.g. BATCH-2026-0001
  batch_name: text('batch_name'),
  order_id: text('order_id'), // linked order (optional)
  status: batchStatusEnum('status').notNull().default('queued'),
  roast_level: text('roast_level').notNull(),
  charge_kg: numeric('charge_kg', { precision: 10, scale: 3 }).notNull(), // raw green weight in
  output_kg: numeric('output_kg', { precision: 10, scale: 3 }), // roasted weight out
  loss_pct: numeric('loss_pct', { precision: 5, scale: 2 }), // weight loss %
  charge_temp_c: numeric('charge_temp_c', { precision: 6, scale: 1 }),
  drop_temp_c: numeric('drop_temp_c', { precision: 6, scale: 1 }),
  dtr_pct: numeric('dtr_pct', { precision: 5, scale: 2 }),
  roast_profile_id: text('roast_profile_id'),
  machine_id: text('machine_id'),
  scheduled_date: date('scheduled_date').notNull(),
  completed_at: timestamp('completed_at'),
  notes: text('notes'),
  qa_passed: boolean('qa_passed'),
  // lot_selections: [{lot_id, bean_name, pct, kg}]
  lot_selections: jsonb('lot_selections'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

/** Calendar events (user-created events + auto-generated from orders/batches) */
export const calendarEvents = pgTable('calendar_events', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  title: text('title').notNull(),
  date: date('date').notNull(),
  time: text('time'),
  end_time: text('end_time'),
  category: calendarCategoryEnum('category').notNull().default('admin'),
  notes: text('notes'),
  source: text('source').notNull().default('manual'), // manual | order | batch
  ref_id: text('ref_id'), // order.id or batch.id
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Tenant = typeof tenants.$inferSelect
export type TenantInsert = typeof tenants.$inferInsert
export type TenantUser = typeof tenantUsers.$inferSelect
export type Customer = typeof customers.$inferSelect
export type CustomerInsert = typeof customers.$inferInsert
export type Order = typeof orders.$inferSelect
export type OrderInsert = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type OrderItemInsert = typeof orderItems.$inferInsert
export type Product = typeof products.$inferSelect
export type ProductInsert = typeof products.$inferInsert
export type GreenBeanLot = typeof greenBeanLots.$inferSelect
export type GreenBeanLotInsert = typeof greenBeanLots.$inferInsert
export type RoastedInventory = typeof roastedInventory.$inferSelect
export type RoastBatch = typeof roastBatches.$inferSelect
export type RoastBatchInsert = typeof roastBatches.$inferInsert
export type CalendarEvent = typeof calendarEvents.$inferSelect
export type CalendarEventInsert = typeof calendarEvents.$inferInsert
