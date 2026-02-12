'use client';

import { AlertTriangle, Bot, PauseCircle, PlayCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type BotStats = {
  total: number;
  running: number;
  stopped: number;
  error: number;
};

export default function BotStatusOverview({ total, running, stopped, error }: BotStats) {
  const t = useTranslations('BotStatusOverview');

  return (
    <Card className="h-full shadow-sm">
      <CardContent className="grid h-full grid-cols-4 divide-x p-0">
        <div className="flex flex-col items-center justify-center p-4 text-center hover:bg-accent/50">
          <div className="mb-2 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <Bot className="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</div>
          <div className="text-xs font-medium text-muted-foreground">{t('totalBots')}</div>
          <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs text-blue-500 hover:text-blue-700">
            +
            {' '}
            {t('create')}
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center p-4 text-center hover:bg-accent/50">
          <div className="mb-2 rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
            <PlayCircle className="size-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{running}</div>
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {t('running')}
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 text-center hover:bg-accent/50">
          <div className="mb-2 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
            <PauseCircle className="size-6 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stopped}</div>
          <div className="text-xs font-medium text-muted-foreground">{t('stopped')}</div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 text-center hover:bg-accent/50">
          <div className="mb-2 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
            <AlertTriangle className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{error}</div>
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            {t('errors')}
            {error > 0 && <span className="size-2 rounded-full bg-red-500" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
