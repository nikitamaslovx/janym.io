'use client';

import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

type IncomeProps = {
  income24h: number;
  income7d: number;
  income30d: number;
  totalIncome: number;
};

const StatCard = ({ title, value, btcValue, t }: { title: string; value: number; btcValue?: number; t: any }) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-center text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center">
      {btcValue !== undefined && (
        <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
          {btcValue.toFixed(8)}
          {' '}
          ₿
        </div>
      )}
      <div className={`text-xl font-bold ${value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {value > 0 ? '+' : ''}
        {formatCurrency(value)}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        0
        {' '}
        {t('dealsCompleted')}
      </p>
    </CardContent>
  </Card>
);

export default function IncomeStats({ income24h, income7d, income30d, totalIncome }: IncomeProps) {
  const t = useTranslations('IncomeStats');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title={t('period24h')} value={income24h} btcValue={0} t={t} />
      <StatCard title={t('period7d')} value={income7d} btcValue={0} t={t} />
      <StatCard title={t('period30d')} value={income30d} btcValue={0} t={t} />

      <Card className="border-r-4 border-r-emerald-500 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-sm font-medium text-muted-foreground">
            {t('totalIncome')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              USDT
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            173
            {' '}
            {t('dealsCompleted')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
