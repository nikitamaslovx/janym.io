import type { InferSelectModel } from 'drizzle-orm';

import { botsSchema } from '@/models/Schema';

export type Bot = InferSelectModel<typeof botsSchema>;

export type BotStatus = 'running' | 'stopped' | 'error' | 'paused' | 'starting';

export type StrategyType =
  | 'pure_market_making'
  | 'cross_exchange_mining'
  | 'arbitrage'
  | 'avellaneda_market_making'
  | 'perpetual_market_making'
  | 'spot_perpetual_arbitrage'
  | 'liquidity_mining'
  | 'custom';

export interface BotConfig {
  name: string;
  strategyType: StrategyType;
  exchange: string;
  tradingPair: string;
  config: Record<string, unknown>;
}

export interface PureMarketMakingConfig {
  bid_spread: number;
  ask_spread: number;
  order_amount: number;
  order_refresh_time: number;
  max_order_age?: number;
  inventory_skew_enabled?: boolean;
  inventory_target_base_pct?: number;
}

export interface CrossExchangeMiningConfig {
  maker_market: string;
  taker_market: string;
  maker_market_trading_pair: string;
  taker_market_trading_pair: string;
  min_profitability: number;
  order_amount: number;
}

export interface BotCreateInput extends BotConfig {
  organizationId: string;
}

export interface BotUpdateInput extends Partial<BotConfig> {
  id: string;
  organizationId: string;
}
