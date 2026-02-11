import {
  bigint,
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

// Need a database for production? Check out https://www.prisma.io/?via=saasboilerplatesrc
// Tested and compatible with Next.js Boilerplate
export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const botsSchema = pgTable(
  'bots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationSchema.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    strategyType: text('strategy_type').notNull(),
    exchange: text('exchange').notNull(),
    tradingPair: text('trading_pair').notNull(),
    config: jsonb('config').notNull(),
    status: text('status').default('stopped').notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      organizationIdStatusIdx: index('bots_organization_id_status_idx').on(
        table.organizationId,
        table.status,
      ),
    };
  },
);

export const exchangeCredentialsSchema = pgTable(
  'exchange_credentials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationSchema.id, { onDelete: 'cascade' }),
    exchange: text('exchange').notNull(),
    apiKeyEncrypted: text('api_key_encrypted').notNull(),
    apiSecretEncrypted: text('api_secret_encrypted').notNull(),
    passphraseEncrypted: text('passphrase_encrypted'),
    isTestnet: boolean('is_testnet').default(false).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      organizationIdExchangeIdx: uniqueIndex(
        'exchange_credentials_organization_id_exchange_idx',
      ).on(table.organizationId, table.exchange),
    };
  },
);

export const botMetricsSchema = pgTable(
  'bot_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    botId: uuid('bot_id')
      .notNull()
      .references(() => botsSchema.id, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp', { mode: 'date' }).notNull(),
    balanceUsd: decimal('balance_usd', { precision: 20, scale: 8 }),
    totalPnl: decimal('total_pnl', { precision: 20, scale: 8 }),
    totalPnlPct: decimal('total_pnl_pct', { precision: 10, scale: 4 }),
    activeOrdersCount: integer('active_orders_count'),
    filledOrdersCount: integer('filled_orders_count'),
    volume24h: decimal('volume_24h', { precision: 20, scale: 8 }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      botIdTimestampIdx: index('bot_metrics_bot_id_timestamp_idx').on(
        table.botId,
        table.timestamp,
      ),
    };
  },
);

export const ordersSchema = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    botId: uuid('bot_id')
      .notNull()
      .references(() => botsSchema.id, { onDelete: 'cascade' }),
    exchangeOrderId: text('exchange_order_id'),
    tradingPair: text('trading_pair').notNull(),
    orderType: text('order_type').notNull(), // 'buy' | 'sell'
    orderSide: text('order_side').notNull(), // 'limit' | 'market'
    price: decimal('price', { precision: 20, scale: 8 }),
    quantity: decimal('quantity', { precision: 20, scale: 8 }),
    filledQuantity: decimal('filled_quantity', { precision: 20, scale: 8 }),
    status: text('status').notNull(), // 'open' | 'filled' | 'cancelled' | 'failed'
    exchangeTimestamp: timestamp('exchange_timestamp', { mode: 'date' }),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      botIdCreatedAtIdx: index('orders_bot_id_created_at_idx').on(
        table.botId,
        table.createdAt,
      ),
    };
  },
);

export const botLogsSchema = pgTable(
  'bot_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    botId: uuid('bot_id')
      .notNull()
      .references(() => botsSchema.id, { onDelete: 'cascade' }),
    level: text('level').notNull(), // 'info' | 'warning' | 'error'
    message: text('message').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      botIdCreatedAtIdx: index('bot_logs_bot_id_created_at_idx').on(
        table.botId,
        table.createdAt,
      ),
    };
  },
);

export const tradesSchema = pgTable(
  'trades',
  {
    id: serial('id').primaryKey(),
    botId: uuid('bot_id')
      .notNull()
      .references(() => botsSchema.id, { onDelete: 'cascade' }),
    market: text('market').notNull(),
    symbol: text('symbol').notNull(),
    baseAsset: text('base_asset').notNull(),
    quoteAsset: text('quote_asset').notNull(),
    orderType: text('order_type').notNull(),
    tradeType: text('trade_type').notNull(),
    price: decimal('price', { precision: 20, scale: 8 }).notNull(),
    amount: decimal('amount', { precision: 20, scale: 8 }).notNull(),
    exchangeTimestamp: timestamp('exchange_timestamp', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      botIdExchangeTsIdx: index('trades_bot_id_exchange_ts_idx').on(
        table.botId,
        table.exchangeTimestamp,
      ),
    };
  },
);

export const candlesSchema = pgTable(
  'candles',
  {
    id: serial('id').primaryKey(),
    exchange: text('exchange').notNull(),
    symbol: text('symbol').notNull(),
    interval: text('interval').notNull(), // '1m', '5m', '1h', etc.
    timestamp: timestamp('timestamp', { mode: 'date' }).notNull(),
    open: decimal('open', { precision: 20, scale: 8 }).notNull(),
    high: decimal('high', { precision: 20, scale: 8 }).notNull(),
    low: decimal('low', { precision: 20, scale: 8 }).notNull(),
    close: decimal('close', { precision: 20, scale: 8 }).notNull(),
    volume: decimal('volume', { precision: 20, scale: 8 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      exchangeSymbolIntervalTsIdx: uniqueIndex('candles_exchange_symbol_interval_ts_idx').on(
        table.exchange,
        table.symbol,
        table.interval,
        table.timestamp,
      ),
    };
  },
);
