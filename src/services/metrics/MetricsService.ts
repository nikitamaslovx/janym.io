import { and, desc, eq, gte } from 'drizzle-orm';

import { db } from '@/libs/DB';
import {
  botLogsSchema,
  botMetricsSchema,
  botsSchema,
  ordersSchema,
  tradesSchema,
} from '@/models/Schema';
import { redisService } from '@/services/cache/RedisService';

import type {
  BotMetrics,
  MetricPoint,
  PnLData,
  PortfolioValue,
  RiskMetrics,
  Timeframe,
} from './types';

export class MetricsService {
  async collectMetrics(botId: string, metrics: Partial<BotMetrics>): Promise<BotMetrics> {
    const [saved] = await db
      .insert(botMetricsSchema)
      .values({
        botId,
        timestamp: metrics.timestamp || new Date(),
        balanceUsd: metrics.balanceUsd?.toString(),
        totalPnl: metrics.totalPnl?.toString(),
        totalPnlPct: metrics.totalPnlPct?.toString(),
        activeOrdersCount: metrics.activeOrdersCount,
        filledOrdersCount: metrics.filledOrdersCount,
        volume24h: metrics.volume24h?.toString(),
      })
      .returning();

    if (!saved) {
      throw new Error('Failed to save metrics');
    }

    return {
      id: saved.id,
      botId: saved.botId,
      timestamp: saved.timestamp,
      balanceUsd: saved.balanceUsd ? Number.parseFloat(saved.balanceUsd) : null,
      totalPnl: saved.totalPnl ? Number.parseFloat(saved.totalPnl) : null,
      totalPnlPct: saved.totalPnlPct ? Number.parseFloat(saved.totalPnlPct) : null,
      activeOrdersCount: saved.activeOrdersCount,
      filledOrdersCount: saved.filledOrdersCount,
      volume24h: saved.volume24h ? Number.parseFloat(saved.volume24h) : null,
      createdAt: saved.createdAt,
    };
  }

  async getHistoricalMetrics(
    botId: string,
    timeframe: Timeframe = '1d',
  ): Promise<MetricPoint[]> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '4h':
        startDate = new Date(now.getTime() - 4 * 60 * 60 * 1000);
        break;
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
    }

    const metrics = await db
      .select()
      .from(botMetricsSchema)
      .where(
        and(
          eq(botMetricsSchema.botId, botId),
          gte(botMetricsSchema.timestamp, startDate),
        ),
      )
      .orderBy(desc(botMetricsSchema.timestamp))
      .limit(1000);

    return metrics.map(m => ({
      timestamp: m.timestamp,
      balanceUsd: m.balanceUsd ? Number.parseFloat(m.balanceUsd) : 0,
      totalPnl: m.totalPnl ? Number.parseFloat(m.totalPnl) : 0,
      totalPnlPct: m.totalPnlPct ? Number.parseFloat(m.totalPnlPct) : 0,
    }));
  }

  async getLatestMetrics(botId: string): Promise<BotMetrics | null> {
    // Try cache first
    const cacheKey = `metrics:latest:${botId}`;
    const cached = await redisService.get<BotMetrics>(cacheKey);
    if (cached) {
      return cached;
    }

    const [latest] = await db
      .select()
      .from(botMetricsSchema)
      .where(eq(botMetricsSchema.botId, botId))
      .orderBy(desc(botMetricsSchema.timestamp))
      .limit(1);

    if (!latest) {
      return null;
    }

    const result = {
      id: latest.id,
      botId: latest.botId,
      timestamp: latest.timestamp,
      balanceUsd: latest.balanceUsd ? Number.parseFloat(latest.balanceUsd) : null,
      totalPnl: latest.totalPnl ? Number.parseFloat(latest.totalPnl) : null,
      totalPnlPct: latest.totalPnlPct ? Number.parseFloat(latest.totalPnlPct) : null,
      activeOrdersCount: latest.activeOrdersCount,
      filledOrdersCount: latest.filledOrdersCount,
      volume24h: latest.volume24h ? Number.parseFloat(latest.volume24h) : null,
      createdAt: latest.createdAt,
    };

    // Cache for 60 seconds
    await redisService.set(cacheKey, result, 60);

    return result;
  }

  async calculatePnL(botId: string, periodDays: number = 30): Promise<PnLData> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const metrics = await db
      .select()
      .from(botMetricsSchema)
      .where(
        and(
          eq(botMetricsSchema.botId, botId),
          gte(botMetricsSchema.timestamp, startDate),
        ),
      )
      .orderBy(botMetricsSchema.timestamp);

    if (metrics.length === 0) {
      return {
        total: 0,
        totalPct: 0,
        realized: 0,
        unrealized: 0,
        period: {
          start: startDate,
          end: new Date(),
        },
      };
    }

    const firstMetric = metrics[0];
    const lastMetric = metrics[metrics.length - 1];

    if (!firstMetric || !lastMetric) {
      return {
        total: 0,
        totalPct: 0,
        realized: 0,
        unrealized: 0,
        period: {
          start: startDate,
          end: new Date(),
        },
      };
    }

    const initialBalance = firstMetric.balanceUsd ? Number.parseFloat(firstMetric.balanceUsd) : 0;
    const finalBalance = lastMetric.balanceUsd ? Number.parseFloat(lastMetric.balanceUsd) : 0;
    const totalPnl = finalBalance - initialBalance;
    const totalPct = initialBalance > 0 ? (totalPnl / initialBalance) * 100 : 0;

    // Simplified: assume all PnL is realized for now
    // In production, this should calculate based on actual trades
    const realized = totalPnl;
    const unrealized = 0;

    return {
      total: totalPnl,
      totalPct,
      realized,
      unrealized,
      period: {
        start: firstMetric.timestamp,
        end: lastMetric.timestamp,
      },
    };
  }

  async getPortfolioValue(orgId: string): Promise<PortfolioValue> {
    // Try cache first
    const cacheKey = `portfolio:${orgId}`;
    const cached = await redisService.get<PortfolioValue>(cacheKey);
    if (cached) {
      // return cached; // Skip cache for now to verify implementation
    }

    // Get all bots for organization
    const bots = await db
      .select()
      .from(botsSchema)
      .where(eq(botsSchema.organizationId, orgId));

    // Get all connected exchanges
    const { credentialsService } = await import('@/services/exchange/CredentialsService');
    const { exchangeAPIService } = await import('@/services/exchange/ExchangeAPIService');
    const allExchanges = await credentialsService.listCredentials(orgId);

    let totalBalance = 0;
    let totalPnl = 0;
    const byExchange: Record<string, number> = {};
    const byStrategy: Record<string, number> = {};
    let activeBotsCount = 0;

    // 1. Fetch real balances from each connected exchange
    await Promise.all(
      allExchanges.map(async (cred) => {
        try {
          const fullCreds = await credentialsService.getCredentials(orgId, cred.exchange);
          if (!fullCreds) {
            return;
          }

          const accountInfo = await exchangeAPIService.getAccountInfo(
            cred.exchange as any,
            fullCreds,
          );
          if (!accountInfo) {
            return;
          }

          let exchangeTotalUsd = 0;
          for (const balance of accountInfo.balances) {
            if (balance.total <= 0) {
              continue;
            }

            // If it's already a stablecoin, use 1.0 as price
            if (['USDT', 'USDC', 'DAI', 'BUSD'].includes(balance.currency.toUpperCase())) {
              exchangeTotalUsd += balance.total;
            } else {
              // Try to get price in USDT
              const price = await exchangeAPIService.getTickerPrice(
                cred.exchange as any,
                `${balance.currency}-USDT`,
                fullCreds,
              );
              if (price) {
                exchangeTotalUsd += balance.total * price;
              } else {
                // If price not found, we don't count it for now (or use a fixed minor value)
                // console.warn(`Could not find price for ${balance.currency}`);
              }
            }
          }

          byExchange[cred.exchange] = exchangeTotalUsd;
          totalBalance += exchangeTotalUsd;
        } catch (err) {
          console.error(`Failed to fetch real balance for ${cred.exchange}:`, err);
        }
      }),
    );

    // 2. Add bot specific metrics (PnL calculation)
    const botIds = bots.map(b => b.id);
    if (botIds.length > 0) {
      const latestMetrics = await Promise.all(
        botIds.map(botId => this.getLatestMetrics(botId)),
      );

      bots.forEach((bot, index) => {
        const metrics = latestMetrics[index];
        if (metrics) {
          if (metrics.totalPnl) {
            totalPnl += metrics.totalPnl;
          }
        }

        if (bot.status === 'running') {
          activeBotsCount += 1;
        }

        // We use bot weights for strategy distribution if real balance is available
        // For now, simplify and use 0 if metrics not found
        byStrategy[bot.strategyType]
          = (byStrategy[bot.strategyType] || 0) + (metrics?.balanceUsd || 0);
      });
    }

    const totalPnlPct = totalBalance > 0 ? (totalPnl / totalBalance) * 100 : 0;

    const result = {
      totalBalance,
      totalPnl,
      totalPnlPct,
      botsCount: bots.length,
      activeBotsCount,
      byExchange,
      byStrategy,
    };

    // Cache for 30 seconds
    await redisService.set(cacheKey, result, 30);

    return result;
  }

  async getOrders(
    botId: string,
    status?: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const conditions = [eq(ordersSchema.botId, botId)];
    if (status) {
      conditions.push(eq(ordersSchema.status, status));
    }

    const orders = await db
      .select()
      .from(ordersSchema)
      .where(and(...conditions))
      .orderBy(desc(ordersSchema.createdAt))
      .limit(limit)
      .offset(offset);

    return orders.map(o => ({
      id: o.id,
      botId: o.botId,
      exchangeOrderId: o.exchangeOrderId,
      tradingPair: o.tradingPair,
      orderType: o.orderType as 'buy' | 'sell',
      orderSide: o.orderSide as 'limit' | 'market',
      price: o.price ? Number.parseFloat(o.price) : null,
      quantity: o.quantity ? Number.parseFloat(o.quantity) : null,
      filledQuantity: o.filledQuantity ? Number.parseFloat(o.filledQuantity) : null,
      status: o.status as 'open' | 'filled' | 'cancelled' | 'failed',
      exchangeTimestamp: o.exchangeTimestamp,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
  }

  async saveOrder(order: {
    botId: string;
    exchangeOrderId?: string;
    tradingPair: string;
    orderType: 'buy' | 'sell';
    orderSide: 'limit' | 'market';
    price?: number;
    quantity?: number;
    filledQuantity?: number;
    status: 'open' | 'filled' | 'cancelled' | 'failed';
    exchangeTimestamp?: Date;
  }) {
    const [saved] = await db
      .insert(ordersSchema)
      .values({
        botId: order.botId,
        exchangeOrderId: order.exchangeOrderId,
        tradingPair: order.tradingPair,
        orderType: order.orderType,
        orderSide: order.orderSide,
        price: order.price?.toString(),
        quantity: order.quantity?.toString(),
        filledQuantity: order.filledQuantity?.toString(),
        status: order.status,
        exchangeTimestamp: order.exchangeTimestamp,
      })
      .returning();

    return saved;
  }

  async saveLog(log: {
    botId: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    const [saved] = await db
      .insert(botLogsSchema)
      .values({
        botId: log.botId,
        level: log.level,
        message: log.message,
        metadata: log.metadata || null,
      })
      .returning();

    return saved;
  }

  async calculateRiskMetrics(botId: string, timeframe: Timeframe = '30d'): Promise<RiskMetrics> {
    const metrics = await this.getHistoricalMetrics(botId, timeframe);

    if (metrics.length < 2) {
      return {
        sharpeRatio: 0,
        maxDrawdown: 0,
        maxDrawdownPct: 0,
        winRate: 0,
        totalTrades: 0,
      };
    }

    // 1. Calculate Sharpe Ratio
    // We assume 1 point per hour if data is dense, or whatever we have
    const returns: number[] = [];
    for (let i = 1; i < metrics.length; i++) {
      const prev = metrics[i - 1]?.balanceUsd || 0;
      const curr = metrics[i]?.balanceUsd || 0;
      if (prev > 0) {
        returns.push((curr - prev) / prev);
      }
    }

    let sharpeRatio = 0;
    if (returns.length > 0) {
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const stdDev = Math.sqrt(
        returns.map(x => (x - avgReturn) ** 2).reduce((a, b) => a + b, 0)
        / returns.length,
      );

      if (stdDev > 0) {
        // Annualize hourly returns (24 * 365 = 8760 hours in year)
        // Adjust based on typical sampling freq. Here assuming hourly.
        sharpeRatio = (avgReturn / stdDev) * Math.sqrt(8760);
      }
    }

    // 2. Calculate Max Drawdown
    let peak = -Infinity;
    let maxDrawdown = 0;
    let maxDrawdownPct = 0;

    metrics.forEach((m) => {
      if (m.balanceUsd > peak) {
        peak = m.balanceUsd;
      }
      const dd = peak - m.balanceUsd;
      const ddPct = peak > 0 ? (dd / peak) * 100 : 0;

      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
      if (ddPct > maxDrawdownPct) {
        maxDrawdownPct = ddPct;
      }
    });

    // 3. Stats from trades
    const trades = await db
      .select()
      .from(tradesSchema)
      .where(eq(tradesSchema.botId, botId));

    const totalTrades = trades.length;
    // Simple win rate based on trade_type if available or PnL of trade
    // Hummingbot doesn't explicitly flag "winning" trade, we'd need to match buy/sell
    // For now, let's look at consecutive trades or placeholder
    const winRate = totalTrades > 0 ? 50 : 0; // Placeholder until we have match-engine logic

    return {
      sharpeRatio,
      maxDrawdown,
      maxDrawdownPct,
      winRate,
      totalTrades,
    };
  }
}

export const metricsService = new MetricsService();
