import {
  mysqlTable,
  varchar,
  int,
  boolean,
  decimal,
  datetime,
  json,
  mysqlEnum,
  text,
  bigint,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * ShadyCard — MySQL Schema (Converted from PostgreSQL)
 *
 * Notes:
 *  - pgEnum → mysqlEnum (MySQL ENUM type)
 *  - numeric(P, S) → decimal(P, S) (MySQL DECIMAL)
 *  - serial → int auto_increment (drizzle's int().autoincrement())
 *  - jsonb → json
 *  - timestamp defaultNow → datetime default now (Drizzle maps)
 *  - text columns for long strings (using text() for code-rich fields)
 */

// ====== Enums ======
export const quantityTypeEnum = mysqlEnum("quantity_type", ["fixed", "range", "list"]).default("fixed");
export const productChangeTypeEnum = mysqlEnum("product_change_type", ["profit", "max_quantity"]);

// ====== Users ======
export const usersTable = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  telegramId: varchar("telegram_id", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 128 }).notNull(),
  email: varchar("email", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }),
  // Drizzle requires explicit precision/scale for decimal
  balanceUsd: decimal("balance_usd", { precision: 24, scale: 12 }).notNull().default("0"),
  balanceSyp: decimal("balance_syp", { precision: 14, scale: 2 }).notNull().default("0"),
  role: varchar("role", { length: 32 }).notNull().default("user"),
  banned: boolean("banned").notNull().default(false),
  vipLevel: int("vip_level").notNull().default(0),
  referralCode: varchar("referral_code", { length: 64 }),
  referredBy: int("referred_by"),
  // Web auth token (for website login, separate from Telegram identity)
  webAuthToken: varchar("web_auth_token", { length: 255 }),
  webAuthExpiresAt: datetime("web_auth_expires_at"),
  lastLoginAt: datetime("last_login_at"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Categories ======
export const categoriesTable = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  image: varchar("image", { length: 1024 }).notNull(),
  order: int("order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// ====== Products ======
export const productsTable = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("category_id").notNull().references(() => categoriesTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  image: varchar("image", { length: 1024 }).notNull(),
  priceUsd: decimal("price_usd", { precision: 24, scale: 12 }).notNull(),
  priceSyp: decimal("price_syp", { precision: 14, scale: 2 }).notNull(),
  basePriceUsd: decimal("base_price_usd", { precision: 24, scale: 12 }),
  providerUnitPrice: decimal("provider_unit_price", { precision: 16, scale: 8 }),
  storeProfitPerUnit: decimal("store_profit_per_unit", { precision: 16, scale: 8 }).notNull().default("0"),
  finalUnitPrice: decimal("final_unit_price", { precision: 16, scale: 8 }),
  productType: varchar("product_type", { length: 64 }).notNull().default("package"),
  available: boolean("available").notNull().default(true),
  minQty: decimal("min_qty", { precision: 14, scale: 2 }),
  maxQty: decimal("max_qty", { precision: 14, scale: 2 }),
  minQuantity: int("min_quantity"),
  maxQuantity: int("max_quantity"),
  quantityType: quantityTypeEnum.notNull(),
  quantityValues: json("quantity_values"),
  description: text("description"),
  featured: boolean("featured").notNull().default(false),
  providerId: int("provider_id"),
  source: varchar("source", { length: 32 }).notNull().default("manual"),
  providerProductId: int("provider_product_id"),
});

// ====== News ======
export const newsTable = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  content: text("content").notNull(),
  type: varchar("type", { length: 64 }).notNull().default("general"),
  active: boolean("active").notNull().default(true),
});

// ====== Banners ======
export const bannersTable = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  image: varchar("image", { length: 1024 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  link: varchar("link", { length: 1024 }),
  order: int("order").notNull().default(0),
});

// ====== Payment Methods ======
export const paymentMethodsTable = mysqlTable("payment_methods", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }).notNull(),
  instructions: text("instructions"),
  walletAddress: varchar("wallet_address", { length: 512 }),
  logoImage: varchar("logo_image", { length: 1024 }),
  qrImage: varchar("qr_image", { length: 1024 }),
  minAmount: decimal("min_amount", { precision: 12, scale: 2 }).notNull().default("1"),
  active: boolean("active").notNull().default(true),
});

// ====== Social Links ======
export const socialLinksTable = mysqlTable("social_links", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 64 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  label: varchar("label", { length: 128 }).notNull(),
  order: int("order").notNull().default(0),
});

// ====== Orders ======
export const ordersTable = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("order_number", { length: 64 }).notNull().unique(),
  userId: int("user_id").notNull().references(() => usersTable.id),
  productId: int("product_id").notNull().references(() => productsTable.id),
  quantity: decimal("quantity", { precision: 14, scale: 2 }).notNull(),
  userIdentifier: varchar("user_identifier", { length: 255 }),
  totalUsd: decimal("total_usd", { precision: 24, scale: 12 }).notNull(),
  totalSyp: decimal("total_syp", { precision: 14, scale: 2 }).notNull(),
  costUsd: decimal("cost_usd", { precision: 24, scale: 12 }).notNull().default("0"),
  status: varchar("status", { length: 32 }).notNull().default("wait"),
  meta: json("meta"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Deposits ======
export const depositsTable = mysqlTable("deposits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => usersTable.id),
  amountUsd: decimal("amount_usd", { precision: 24, scale: 12 }).notNull(),
  amountSyp: decimal("amount_syp", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 8 }).notNull(),
  method: varchar("method", { length: 32 }).notNull(),
  methodLabel: varchar("method_label", { length: 128 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }).notNull(),
  proofImage: varchar("proof_image", { length: 1024 }),
  telegramMessageId: int("telegram_message_id"),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Shamcash used transaction refs ======
export const shamcashUsedTransactionRefsTable = mysqlTable("shamcash_used_transaction_refs", {
  id: int("id").autoincrement().primaryKey(),
  transactionRef: varchar("transaction_ref", { length: 255 }).notNull().unique(),
  depositId: int("deposit_id").references(() => depositsTable.id),
  userId: int("user_id").references(() => usersTable.id),
  invoiceId: varchar("invoice_id", { length: 255 }),
  amountUsd: decimal("amount_usd", { precision: 24, scale: 12 }),
  amountSyp: decimal("amount_syp", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 8 }),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Admins ======
export const adminsTable = mysqlTable("admins", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 128 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 32 }).notNull().default("admin"),
  permissions: json("permissions"),
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  active: boolean("active").notNull().default(true),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Product Changes Log ======
export const productChangesLogTable = mysqlTable("product_changes_log", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id").notNull().references(() => productsTable.id),
  changeType: productChangeTypeEnum.notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  providerSnapshot: json("provider_snapshot"),
  adminId: int("admin_id").references(() => adminsTable.id),
  changedAt: datetime("changed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Settings (key-value) ======
export const settingsTable = mysqlTable("settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: json("value").notNull(),
});

// ====== Providers ======
export const providersTable = mysqlTable("providers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  apiUrl: varchar("api_url", { length: 1024 }),
  apiKey: varchar("api_key", { length: 512 }),
  notes: text("notes"),
  priority: int("priority").notNull().default(0),
  active: boolean("active").notNull().default(true),
  providerType: varchar("provider_type", { length: 64 }).default("custom"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Coupons ======
export const couponsTable = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  discountPct: decimal("discount_pct", { precision: 5, scale: 2 }).notNull(),
  maxUses: int("max_uses").notNull().default(100),
  usedCount: int("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== VIP Memberships ======
export const vipMembershipsTable = mysqlTable("vip_memberships", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  requiredAmount: decimal("required_amount", { precision: 12, scale: 2 }).notNull(),
  profitPct: decimal("profit_pct", { precision: 5, scale: 2 }).notNull(),
  badge: varchar("badge", { length: 64 }),
  hidden: boolean("hidden").notNull().default(false),
});

// ====== Auto Codes ======
export const autoCodesTable = mysqlTable("auto_codes", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id").notNull().references(() => productsTable.id),
  code: varchar("code", { length: 255 }).notNull(),
  note: text("note"),
  used: boolean("used").notNull().default(false),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Order Messages ======
export const orderMessagesTable = mysqlTable("order_messages", {
  id: int("id").autoincrement().primaryKey(),
  event: varchar("event", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
});

// ====== Activity Log ======
export const activityLogTable = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  actorType: varchar("actor_type", { length: 32 }).notNull().default("admin"),
  actorId: varchar("actor_id", { length: 64 }),
  actorName: varchar("actor_name", { length: 128 }),
  action: varchar("action", { length: 128 }).notNull(),
  target: varchar("target", { length: 128 }),
  meta: json("meta"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== API Keys ======
export const apiKeysTable = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  keyValue: varchar("key_value", { length: 255 }).notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ====== Notifications ======
export const notificationsTable = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  targetType: varchar("target_type", { length: 32 }).notNull().default("all"),
  targetUserId: int("target_user_id"),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("sent"),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
