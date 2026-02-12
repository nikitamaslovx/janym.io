'use client';

import { RefreshCw, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

export default function FinancePage() {
  const t = useTranslations('Finance');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('total_balance')}
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              0.01423102
              {' '}
              <span className="text-lg text-amber-500">₿</span>
            </div>
            <p className="text-xs text-muted-foreground">
              ≈
              {' '}
              {formatCurrency(426.19)}
            </p>
            <div className="mt-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                {t('refill')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('commission_paid')}
            </CardTitle>
            <RefreshCw className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground">
              {t('commission_period')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('transactions_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[150px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">{t('no_transactions')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
