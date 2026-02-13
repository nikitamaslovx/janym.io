'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export const ProfileSettingsForm = () => {
  const t = useTranslations('UserProfile');

  const blocks = [
    { id: 'revenue_bot_news', label: t('blocks.revenue_bot_news'), defaultChecked: false },
    { id: 'bot_stats', label: t('blocks.bot_stats'), defaultChecked: true },
    { id: 'profit_stats', label: t('blocks.profit_stats'), defaultChecked: true },
    { id: 'my_balances', label: t('blocks.my_balances'), defaultChecked: true },
    { id: 'tooltips', label: t('blocks.tooltips'), defaultChecked: false },
    { id: 'market_bots', label: t('blocks.market_bots'), defaultChecked: false },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-8 border-t pt-8">
        <h2 className="text-xl font-semibold">{t('control_panel.title')}</h2>

        <div className="space-y-6 rounded-xl border bg-card/30 p-8">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">
              {t('control_panel.stats_period')}
              :
            </Label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('control_panel.stats_options.days_1_7_30')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('control_panel.stats_options.days_1_7_30')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-8 border-t pt-8">
        <h2 className="text-xl font-semibold">
          {t('blocks.title')}
          :
        </h2>

        <div className="rounded-xl border bg-card/30 p-8">
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {blocks.map(block => (
              <div key={block.id} className="flex items-center justify-between gap-4">
                <Label htmlFor={block.id} className="text-sm font-normal text-muted-foreground">
                  {block.label}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-[10px] font-bold text-muted-foreground">{block.defaultChecked ? 'YES' : 'NO'}</span>
                  <Switch id={block.id} defaultChecked={block.defaultChecked} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between md:w-1/3">
            <Label htmlFor="chat_icon" className="text-sm font-normal text-muted-foreground">{t('blocks.chat_icon')}</Label>
            <div className="flex items-center gap-2">
              <span className="w-6 text-[10px] font-bold text-muted-foreground">NO</span>
              <Switch id="chat_icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="ip_addresses">{t('advanced.ip_addresses')}</Label>
        <Input id="ip_addresses" placeholder={t('advanced.ip_placeholder')} />
      </div>

      <div className="flex items-center justify-between md:w-1/2">
        <Label htmlFor="auto_restart">{t('advanced.auto_restart')}</Label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground">NO</span>
          <Switch id="auto_restart" />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button size="lg" className="px-8">
          {t('save_changes')}
        </Button>
      </div>
    </div>
  );
};
