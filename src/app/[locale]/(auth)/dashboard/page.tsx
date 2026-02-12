'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import AccountSummary from '@/features/dashboard/components/AccountSummary';
import BotMarketplace from '@/features/dashboard/components/BotMarketplace';
import BotStatusOverview from '@/features/dashboard/components/BotStatusOverview';
import IncomeStats from '@/features/dashboard/components/IncomeStats';

type ReturnType = {
  portfolio: {
    totalBalance: number;
    totalPnl: number;
    activeBotsCount: number;
    botsCount: number;
    // We might need to extend the API to return stopped/error counts,
    // for now we'll calculate or use placeholders if API doesn't support it yet.
  };
};

export default function DashboardPage() {
  const t = useTranslations('DashboardIndex');
  const [data, setData] = useState<ReturnType['portfolio'] | null>(null);
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
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title_bar')}</h1>
        <p className="text-muted-foreground">{t('title_bar_description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Row 1: Account Summary & Bot Status */}
        <div className="h-[280px]">
          <AccountSummary
            balanceUsd={data?.totalBalance || 0}
            balanceBtc={0.01423102} // Placeholder for BTC balance until API supports it
            userId="46630" // Placeholder
          />
        </div>
        <div className="h-[280px]">
          <BotStatusOverview
            total={data?.botsCount || 0}
            running={data?.activeBotsCount || 0}
            stopped={(data?.botsCount || 0) - (data?.activeBotsCount || 0)}
            error={0} // Placeholder
          />
        </div>
      </div>

      {/* Row 2: Income Stats */}
      <div>
        <IncomeStats
          income24h={data?.totalPnl || 0} // Using totalPnl as 24h placeholder for now
          income7d={0}
          income30d={0}
          totalIncome={426.19} // Placeholder
        />
      </div>

      {/* Row 3: Bot Marketplace */}
      <div>
        <BotMarketplace />
      </div>
    </div>
  );
}
