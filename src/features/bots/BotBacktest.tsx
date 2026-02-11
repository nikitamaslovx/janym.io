'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Bot } from '@/types/bot';

type BotBacktestProps = {
  bot: Bot;
};

export const BotBacktest = ({ bot }: BotBacktestProps) => {
  const [interval, setInterval] = useState('1h');
  const [limit, setLimit] = useState(100);
  const [candleStatus, setCandleStatus] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0] ?? '',
  );
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchCandleStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/bots/${bot.id}/backtest/candles?interval=${interval}`);
      if (response.ok) {
        const data = await response.json();
        setCandleStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch candle status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bot.id, interval]);

  useEffect(() => {
    fetchCandleStatus();
  }, [fetchCandleStatus]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/bots/${bot.id}/backtest/candles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: bot.tradingPair,
          interval,
          limit,
        }),
      });
      if (response.ok) {
        await fetchCandleStatus();
      }
    } catch (err) {
      console.error('Failed to download candles:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRunBacktest = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const response = await fetch(`/api/bots/${bot.id}/backtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to run backtest:', err);
      setResult({ success: false, error: 'Network error or gateway unreachable' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historical Data (OHLCV)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="interval-select" className="text-sm font-medium">Interval</label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger id="interval-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 minute</SelectItem>
                  <SelectItem value="5m">5 minutes</SelectItem>
                  <SelectItem value="15m">15 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="4h">4 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="limit-input" className="text-sm font-medium">Limit (Candles)</label>
              <Input
                id="limit-input"
                type="number"
                value={limit}
                onChange={e => setLimit(Number.parseInt(e.target.value, 10))}
                min={1}
                max={1000}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleDownload} disabled={isDownloading || isLoading} className="w-full">
                {isDownloading ? 'Downloading...' : 'Download Candles'}
              </Button>
            </div>
          </div>

          {candleStatus && (
            <div className="space-y-2 rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available in Database:</span>
                <Badge variant="outline">
                  {candleStatus.availableCount}
                  {' '}
                  candles
                </Badge>
              </div>
              {candleStatus.availableCount > 0 && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    First:
                    {' '}
                    {new Date(candleStatus.firstTimestamp).toLocaleString()}
                  </p>
                  <p>
                    Last:
                    {' '}
                    {new Date(candleStatus.lastTimestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Launch Backtest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleRunBacktest}
            disabled={isRunning || !candleStatus || candleStatus.availableCount === 0}
            className="w-full"
          >
            {isRunning ? 'Backtest Running...' : 'Run Simulation'}
          </Button>

          {result && (
            <div className={`rounded-lg p-4 text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {result.success
                ? `Backtest started! Container ID: ${result.container_id?.slice(0, 12)}`
                : `Error: ${result.error}`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
