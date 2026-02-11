'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import type { BotMetrics, Order, MetricPoint, Timeframe } from '@/types/metrics';
import { BotMetricsChart } from './BotMetricsChart';
import { OrdersTable } from './OrdersTable';
import { BotLogsViewer } from './BotLogsViewer';

export const BotDashboard = () => {
  const t = useTranslations('BotDashboard');
  const params = useParams();
  const router = useRouter();
  const botId = params?.id as string;

  const [bot, setBot] = useState<Bot | null>(null);
  const [metrics, setMetrics] = useState<BotMetrics | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<MetricPoint[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!botId) {
      return;
    }

    loadBotData();
    const interval = setInterval(loadBotData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [botId, timeframe]);

  const loadBotData = async () => {
    try {
      setIsLoading(true);
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

      // Load orders
      const ordersResponse = await fetch(`/api/bots/${botId}/orders?limit=50`);
      if (!ordersResponse.ok) {
        throw new Error('Failed to load orders');
      }
      const ordersData = await ordersResponse.json();
      setOrders(ordersData.orders || []);
    } catch (err) {
      console.error('Error loading bot data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

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
      alert('Failed to start bot');
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
      alert('Failed to stop bot');
    }
  };

  if (isLoading) {
    return <div>Loading bot dashboard...</div>;
  }

  if (error || !bot) {
    return (
      <div className="text-center py-8">
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
            {bot.exchange} • {bot.tradingPair} • {bot.strategyType}
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
          {bot.status === 'running' ? (
            <Button variant="destructive" onClick={handleStop}>
              Stop
            </Button>
          ) : (
            <Button onClick={handleStart}>Start</Button>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics?.balanceUsd?.toFixed(2) || '0.00'}
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
              ${metrics?.totalPnl?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalPnlPct?.toFixed(2) || '0.00'}%
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
              ${metrics?.volume24h?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Chart */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('metrics_title')}</h2>
        <Select
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as Timeframe)}
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

      {/* Orders Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('orders_title')}</h2>
        <OrdersTable orders={orders} />
      </div>

      {/* Logs Viewer */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Bot Logs</h2>
        <BotLogsViewer botId={botId} />
      </div>
    </div>
  );
};
