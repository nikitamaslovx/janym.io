'use client';

import { Activity, Cpu, DollarSign, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

type PortfolioData = {
  totalBalance: number;
  totalPnl: number;
  totalPnlPct: number;
  activeBotsCount: number;
  botsCount: number;
};

export const StatsCards = () => {
  const t = useTranslations('StatsCards');
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/portfolio');
        if (response.ok) {
          const result = await response.json();
          setData(result.portfolio);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: t('totalBalance'),
      value: loading ? '...' : formatCurrency(data?.totalBalance || 0),
      icon: DollarSign,
      description: data?.totalPnlPct
        ? `${data.totalPnlPct >= 0 ? '+' : ''}${data.totalPnlPct.toFixed(2)}% ${t('fromLastMonth')}`
        : t('noData'),
      trend: data?.totalPnlPct && data?.totalPnlPct >= 0 ? 'up' : 'down',
    },
    {
      title: t('activeStrategies'),
      value: loading ? '...' : (data?.activeBotsCount || 0).toString(),
      icon: Activity,
      description: `${data?.botsCount || 0} ${t('totalBots')}`,
      trend: 'up',
    },
    {
      title: t('24hPnl'),
      value: loading ? '...' : formatCurrency(data?.totalPnl || 0),
      icon: TrendingUp,
      description: data?.totalPnlPct
        ? `${data.totalPnlPct.toFixed(2)}% ${t('dailyGrowth')}`
        : t('noData'),
      trend: data?.totalPnl && data?.totalPnl >= 0 ? 'up' : 'down',
    },
    {
      title: t('cpuUsage'), // This is still mock data for now as we don't have system metrics yet
      value: '12%',
      icon: Cpu,
      description: t('systemNormal'),
      trend: 'neutral',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, _index) => (
        <Card key={stat.title} className="border-primary/10 bg-card/40 backdrop-blur-md transition-colors hover:bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="mt-1 flex items-center text-xs text-muted-foreground">
              {stat.trend !== 'neutral' && (
                <span className={cn(
                  'mr-1 flex items-center',
                  stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500',
                )}
                >
                  {stat.trend === 'up' ? '+' : ''}
                  {/* Icon could go here */}
                </span>
              )}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
