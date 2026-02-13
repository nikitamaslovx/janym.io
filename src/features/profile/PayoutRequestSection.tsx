'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const PayoutRequestSection = () => {
  const t = useTranslations('UserProfile.payout');
  const refT = useTranslations('UserProfile.referral');

  return (
    <div className="space-y-12">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-8">
          <div className="space-y-6 rounded-xl border bg-card/30 p-8">
            <h3 className="font-semibold">{t('transfer.title')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer_id" className="text-xs uppercase text-muted-foreground">{t('transfer.id_email')}</Label>
                <Input id="transfer_id" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer_amount" className="text-xs uppercase text-muted-foreground">{t('transfer.amount')}</Label>
                <Input id="transfer_amount" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer_comment" className="text-xs uppercase text-muted-foreground">{t('transfer.comment')}</Label>
                <Textarea id="transfer_comment" className="min-h-[100px]" />
              </div>
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">{t('transfer.send')}</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-6 lg:w-96">
          <Card className="relative overflow-hidden border-none bg-blue-600 text-white">
            <CardContent className="p-8">
              <div className="relative z-10 space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold italic">0.00000000</span>
                  <span className="text-2xl font-bold opacity-80">₿</span>
                </div>
                <p className="text-sm font-medium opacity-90">{refT('stats.available')}</p>
              </div>
              {/* Decorative elements to match mockup vibe */}
              <div className="pointer-events-none absolute right-0 top-0 size-full opacity-10">
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/20 blur-3xl" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 rounded-xl border bg-card/30 p-8">
            <h3 className="font-semibold">{t('withdraw.title')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw_wallet" className="text-xs uppercase text-muted-foreground">
                  {t('withdraw.wallet')}
                  :
                </Label>
                <Input id="withdraw_wallet" placeholder={t('withdraw.wallet_placeholder')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdraw_amount" className="text-xs uppercase text-muted-foreground">{t('withdraw.amount')}</Label>
                <Input id="withdraw_amount" defaultValue="0.00000000" />
              </div>
              <div className="pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">{t('withdraw.request')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
