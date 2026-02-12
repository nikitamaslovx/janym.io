'use client';

import { Copy, RefreshCw, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/format';

type AccountSummaryProps = {
  balanceUsd: number;
  balanceBtc?: number;
  userId?: string;
};

export default function AccountSummary({ balanceUsd, balanceBtc = 0, userId = '---' }: AccountSummaryProps) {
  const t = useTranslations('AccountSummary');

  return (
    <Card className="h-full border-l-4 border-l-blue-500 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t('accountInfo')}
          </CardTitle>
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
            <span>ID:</span>
            <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{userId}</span>
            <Button size="icon" variant="ghost" className="size-4" title={t('copyId')}>
              <Copy className="size-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">{t('autoUpdate')}</span>
          <Button size="icon" variant="outline" className="size-8">
            <RefreshCw className="size-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">{t('status')}</span>
            <span className="font-medium text-emerald-600">{t('active')}</span>
          </div>

          <Separator />

          <div>
            <span className="text-sm text-muted-foreground">{t('accountBalance')}</span>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {balanceBtc.toFixed(8)}
                {' '}
                <span className="text-lg text-amber-500">₿</span>
              </span>
              <span className="mb-1 text-sm text-muted-foreground">
                ≈
                {' '}
                {formatCurrency(balanceUsd)}
              </span>
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Wallet className="mr-2 size-4" />
            {t('replenish')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
