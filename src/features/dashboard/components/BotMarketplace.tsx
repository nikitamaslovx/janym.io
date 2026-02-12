'use client';

import { ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/utils/format';

export default function BotMarketplace() {
  const t = useTranslations('BotMarketplace');

  // Mock data for templates
  const templates = [
    {
      id: 'volatility-master',
      name: 'Volatility Master BTC',
      algo: 'Long Grid',
      pnl: 14.90,
      period: '60d',
      minDeposit: 150,
      risk: 'Medium',
      avgDealTime: '10h 29m',
      dealsCount: 105,
      pairs: ['BTC/USDT'],
    },
    {
      id: 'eth-accumulator',
      name: 'ETH Accumulator',
      algo: 'Short Grid',
      pnl: 48.27,
      period: '60d',
      minDeposit: 100,
      risk: 'High',
      avgDealTime: '2h 21m',
      dealsCount: 252,
      pairs: ['ETH/USDT'],
    },
    {
      id: 'sol-scalper',
      name: 'SOL Scalper Pro',
      algo: 'Scalping',
      pnl: 6.35,
      period: '60d',
      minDeposit: 300,
      risk: 'Low',
      avgDealTime: '21h 55m',
      dealsCount: 40,
      pairs: ['SOL/USDT'],
    },
    {
      id: 'stable-farmer',
      name: 'USDT/USDC Farmer',
      algo: 'Arbitrage',
      pnl: 3.24,
      period: '60d',
      minDeposit: 1000,
      risk: 'Minimal',
      avgDealTime: '1d 17h',
      dealsCount: 28,
      pairs: ['USDC/USDT'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{t('title')}</h2>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
          {t('viewAll')}
          {' '}
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {templates.map(template => (
          <Card key={template.id} className="flex flex-col border-t-4 border-t-transparent shadow-sm transition-all hover:border-t-primary hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold">{template.name}</CardTitle>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="font-normal">{template.algo}</Badge>
                    <span className="flex items-center gap-1">
                      {template.pairs[0]}
                    </span>
                  </div>
                </div>
                {template.risk === 'Low' || template.risk === 'Minimal'
                  ? (
                      <ShieldCheck className="size-5 text-emerald-500" />
                    )
                  : (
                      <Zap className="size-5 text-amber-500" />
                    )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('pnl')}
                    {' '}
                    (
                    {template.period}
                    ):
                  </span>
                  <span className="font-bold text-emerald-600">
                    +
                    {formatPercentage(template.pnl * 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('minDeposit')}
                    :
                  </span>
                  <span className="font-medium">{formatCurrency(template.minDeposit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('risk')}
                    :
                  </span>
                  <Badge variant={template.risk === 'High' ? 'destructive' : template.risk === 'Medium' ? 'default' : 'secondary'} className="text-xs">
                    {template.risk}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button className="w-full" variant="outline">
                {t('copyBot')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
