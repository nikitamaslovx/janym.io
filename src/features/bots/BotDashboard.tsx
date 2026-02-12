'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Bot } from '@/types/bot';
import type { BotMetrics, MetricPoint, Order, RiskMetrics, Timeframe, Trade } from '@/types/metrics';

import { BotBacktest } from './BotBacktest';
import { BotLogsViewer } from './BotLogsViewer';
import { BotMetricsChart } from './BotMetricsChart';
import { OrdersTable } from './OrdersTable';
import { PerformanceMetricsCards } from './PerformanceMetricsCards';
import { TradeHistoryTable } from './TradeHistoryTable';

type ActiveTab = 'overview' | 'trades' | 'orders' | 'backtest' | 'logs';

export const BotDashboard = () => {
  const t = useTranslations('BotDashboard');
  const params = useParams();
  const router = useRouter();
  const botId = params?.id as string;

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [bot, setBot] = useState<Bot | null>(null);
  const [metrics, setMetrics] = useState<BotMetrics | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<MetricPoint[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBotData = React.useCallback(async () => {
    try {
      if (!bot) {
        setIsLoading(true);
      }
      setError(null);

      // Load bot info
      const botResponse = await fetch(`/api/bots/${botId}`);
      if (!botResponse.ok) {
        throw new Error('Failed to load bot');
      }
      const botData = await botResponse.json();
      setBot(botData.bot);

      // Load metrics
      const metricsResponse = await fetch(
        `/api/bots/${botId}/metrics?timeframe=${timeframe}`,
      );
      if (!metricsResponse.ok) {
        throw new Error('Failed to load metrics');
      }
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData.latest);
      setHistoricalMetrics(metricsData.historical || []);
      setRiskMetrics(metricsData.risk);

      // Load orders
      const ordersResponse = await fetch(`/api/bots/${botId}/orders?limit=50`);
      if (!ordersResponse.ok) {
        throw new Error('Failed to load orders');
      }
      const ordersData = await ordersResponse.json();
      setOrders(ordersData.orders || []);

      // Load trades
      const tradesResponse = await fetch(`/api/bots/${botId}/trades?limit=50`);
      if (tradesResponse.ok) {
        const tradesData = await tradesResponse.json();
        setTrades(tradesData.trades || []);
      }
    } catch (err) {
      console.error('Error loading bot data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [botId, timeframe, bot]);

  useEffect(() => {
    if (!botId) {
      return;
    }

    loadBotData();
    const interval = setInterval(loadBotData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [botId, loadBotData]);

  const handleStart = async () => {
    try {
      const response = await fetch(`/api/bots/${botId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'start' }),
      });

      if (!response.ok) {
        throw new Error('Failed to start bot');
      }

      await loadBotData();
    } catch (err) {
      console.error('Error starting bot:', err);
      setError('Failed to start bot');
    }
  };

  const handleStop = async () => {
    try {
      const response = await fetch(`/api/bots/${botId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'stop' }),
      });

      if (!response.ok) {
        throw new Error('Failed to stop bot');
      }

      await loadBotData();
    } catch (err) {
      console.error('Error stopping bot:', err);
      setError('Failed to stop bot');
    }
  };

  if (isLoading) {
    return <div>Loading bot dashboard...</div>;
  }

  if (error || !bot) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">{error || 'Bot not found'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{bot.name}</h1>
          <p className="text-muted-foreground">
            {bot.exchange}
            {' '}
            •
            {' '}
            {bot.tradingPair}
            {' '}
            •
            {' '}
            {bot.strategyType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              bot.status === 'running'
                ? 'default'
                : bot.status === 'error'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {bot.status}
          </Badge>
          {bot.status === 'running'
            ? (
                <Button variant="destructive" onClick={handleStop}>
                  Stop
                </Button>
              )
            : (
                <Button onClick={handleStart}>Start</Button>
              )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'trades'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Trades
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'orders'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('backtest')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'backtest'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Backtest
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'logs'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Logs
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {riskMetrics && (
              <>
                <h2 className="text-2xl font-bold">Performance Analytics</h2>
                <PerformanceMetricsCards metrics={riskMetrics} />
              </>
            )}

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {metrics?.balanceUsd?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      (metrics?.totalPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    $
                    {metrics?.totalPnl?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.totalPnlPct?.toFixed(2) || '0.00'}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.activeOrdersCount || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {metrics?.volume24h?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t('metrics_title')}</h2>
              <Select
                value={timeframe}
                onValueChange={value => setTimeframe(value as Timeframe)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="4h">Last 4 Hours</SelectItem>
                  <SelectItem value="1d">Last Day</SelectItem>
                  <SelectItem value="7d">Last Week</SelectItem>
                  <SelectItem value="30d">Last Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <BotMetricsChart
              data={historicalMetrics}
              title={t('metrics_chart_title')}
              description={t('metrics_chart_description')}
            />
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Trade History</h2>
            <TradeHistoryTable trades={trades} />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{t('orders_title')}</h2>
            <OrdersTable orders={orders} />
          </div>
        )}

        {activeTab === 'backtest' && (
          <BotBacktest bot={bot} />
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Bot Logs</h2>
            <BotLogsViewer botId={botId} />
          </div>
        )}
      </div>
    </div>
  );
};
