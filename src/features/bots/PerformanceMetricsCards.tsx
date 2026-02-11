'use client';

import { Activity, Percent, TrendingDown, TrendingUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { RiskMetrics } from '@/types/metrics';

type PerformanceMetricsCardsProps = {
  metrics: RiskMetrics;
};

export const PerformanceMetricsCards = ({ metrics }: PerformanceMetricsCardsProps) => {
  const cards = [
    {
      title: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2),
      description: 'Risk-adjusted return',
      icon: Activity,
      color: metrics.sharpeRatio > 1 ? 'text-green-500' : 'text-yellow-500',
    },
    {
      title: 'Max Drawdown',
      value: `${metrics.maxDrawdownPct.toFixed(2)}%`,
      description: 'Peak-to-trough decline',
      icon: TrendingDown,
      color: 'text-red-500',
    },
    {
      title: 'Win Rate',
      value: `${metrics.winRate.toFixed(1)}%`,
      description: 'Percentage of profitable trades',
      icon: Percent,
      color: 'text-blue-500',
    },
    {
      title: 'Total Trades',
      value: metrics.totalTrades.toString(),
      description: 'All executed orders',
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`size-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
