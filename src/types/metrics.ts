export interface BotMetrics {
  id: string;
  botId: string;
  timestamp: Date;
  balanceUsd: number | null;
  totalPnl: number | null;
  totalPnlPct: number | null;
  activeOrdersCount: number | null;
  filledOrdersCount: number | null;
  volume24h: number | null;
  createdAt: Date;
}

export interface MetricPoint {
  timestamp: Date;
  balanceUsd: number;
  totalPnl: number;
  totalPnlPct: number;
}

export type Timeframe = '1h' | '4h' | '1d' | '7d' | '30d' | 'all';

export interface PnLData {
  total: number;
  totalPct: number;
  realized: number;
  unrealized: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface PortfolioValue {
  totalBalance: number;
  totalPnl: number;
  totalPnlPct: number;
  botsCount: number;
  activeBotsCount: number;
  byExchange: Record<string, number>;
  byStrategy: Record<string, number>;
}

export interface Order {
  id: string;
  botId: string;
  exchangeOrderId: string | null;
  tradingPair: string;
  orderType: 'buy' | 'sell';
  orderSide: 'limit' | 'market';
  price: number | null;
  quantity: number | null;
  filledQuantity: number | null;
  status: 'open' | 'filled' | 'cancelled' | 'failed';
  exchangeTimestamp: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BotLog {
  id: string;
  botId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
