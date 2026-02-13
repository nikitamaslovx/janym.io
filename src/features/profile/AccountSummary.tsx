'use client';

import { CopyIcon, ExternalLinkIcon, InfoIcon, PlayCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';

export const AccountSummary = () => {
  const t = useTranslations('UserProfile.account_summary');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-12">
          <div className="space-y-1">
            <span className="text-xs uppercase text-muted-foreground">{t('status')}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-orange-500">{t('paused')}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase text-muted-foreground">{t('id')}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">46630</span>
              <button className="text-muted-foreground hover:text-foreground">
                <CopyIcon className="size-4" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase text-muted-foreground">{t('balance')}</span>
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-red-500">-0.00069816</span>
              <span className="text-orange-500">₿</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
            +
            {' '}
            {t('replenish')}
          </Button>
          <Button variant="outline">
            {t('history')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <InfoIcon className="size-4" />
          {t('knowledge_base')}
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ExternalLinkIcon className="size-4" />
          {t('consultation')}
        </button>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <PlayCircleIcon className="size-4" />
          {t('video_lessons')}
        </button>
      </div>
    </div>
  );
};
