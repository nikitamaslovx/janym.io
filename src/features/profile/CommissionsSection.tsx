'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import { Card, CardContent } from '@/components/ui/card';

export const CommissionsSection = () => {
  const t = useTranslations('UserProfile.commissions');

  const commissions = [
    { title: t('ordinary'), rate: '20%' },
    { title: t('usdm'), rate: '20%' },
    { title: t('coinm'), rate: '20%' },
    { title: t('marketplace'), rate: '20%' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {commissions.map((item, index) => (
          <Card key={index} className="bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{item.rate.split('%')[0]}</span>
                <span className="text-xl text-muted-foreground">%</span>
              </div>
              <p className="mt-2 text-sm leading-tight text-muted-foreground">
                {t('rate')}
                {' '}
                (
                {item.title}
                ):
              </p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('deducted')}
                  :
                </span>
                <div className="flex items-center gap-1 font-medium">
                  0.00
                  <span className="text-cyan-500">₮</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
