import type { InferSelectModel } from 'drizzle-orm';

import type { botsSchema } from '@/models/Schema';

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
  | 'v2'
  | 'custom';

export type BotConfig = {
  name: string;
  strategyType: StrategyType;
  exchange: string;
  tradingPair: string;
  config: Record<string, unknown>;
};

export type PureMarketMakingConfig = {
  bid_spread: number;
  ask_spread: number;
  order_amount: number;
  order_refresh_time: number;
  max_order_age?: number;
  inventory_skew_enabled?: boolean;
  inventory_target_base_pct?: number;
};

export type CrossExchangeMiningConfig = {
  maker_market: string;
  taker_market: string;
  maker_market_trading_pair: string;
  taker_market_trading_pair: string;
  min_profitability: number;
  order_amount: number;
};

export type BotCreateInput = BotConfig & {
  organizationId: string;
};

export type BotUpdateInput = Partial<BotConfig> & {
  id: string;
  organizationId: string;
};
