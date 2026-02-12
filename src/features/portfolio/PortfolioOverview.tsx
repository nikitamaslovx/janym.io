'use client';

import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { PortfolioValue } from '@/types/metrics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const PortfolioOverview = () => {
  const t = useTranslations('PortfolioOverview');
  const [portfolio, setPortfolio] = useState<PortfolioValue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    try {
      if (!portfolio) {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch('/api/portfolio');
      if (!response.ok) {
        throw new Error('Failed to load portfolio');
      }

      const data = await response.json();
      setPortfolio(data.portfolio);
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [portfolio]);

  useEffect(() => {
    loadPortfolio();
    const interval = setInterval(loadPortfolio, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [loadPortfolio]);

  if (isLoading) {
    return <div>Loading portfolio...</div>;
  }

  if (error || !portfolio) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">{error || 'No portfolio data'}</p>
      </div>
    );
  }

  const exchangeData = Object.entries(portfolio.byExchange).map(([name, value]) => ({
    name,
    value,
  }));

  const strategyData = Object.entries(portfolio.byStrategy).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_balance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {portfolio.totalBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_pnl')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                portfolio.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              $
              {portfolio.totalPnl.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolio.totalPnlPct.toFixed(2)}
              %
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_bots')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.botsCount}</div>
            <p className="text-xs text-muted-foreground">
              {portfolio.activeBotsCount}
              {' '}
              {t('active')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('exchanges')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exchangeData.length}</div>
            <p className="text-xs text-muted-foreground">{t('connected')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('by_exchange_title')}</CardTitle>
            <CardDescription>{t('by_exchange_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exchangeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {exchangeData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${(value || 0).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('by_strategy_title')}</CardTitle>
            <CardDescription>{t('by_strategy_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={strategyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {strategyData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${(value || 0).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
