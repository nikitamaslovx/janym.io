'use client';

import { CheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export const NotificationsSection = () => {
  const t = useTranslations('UserProfile.notifications');
  const commonT = useTranslations('UserProfile');

  const notificationTypes = [
    { id: 'tp_executed', label: t('types.tp_executed'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
    { id: 'grid_executed', label: t('types.grid_executed'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
    { id: 'sl_executed', label: t('types.sl_executed'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
    { id: 'errors', label: t('types.errors'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
    { id: 'balance', label: t('types.balance'), options: ['WEB', 'e-mail', 'SMS', 'Telegram'], defaults: { Telegram: false } },
    { id: 'news', label: t('types.news'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { WEB: true, Telegram: false } },
    { id: 'bot_started', label: t('types.bot_started'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
    { id: 'bot_stopped', label: t('types.bot_stopped'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
    { id: 'tp_terminal', label: t('types.tp_terminal'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
    { id: 'private_msgs', label: t('types.private_msgs'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { WEB: true, Telegram: true } },
    { id: 'market_sale', label: t('types.market_sale'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { 'WEB': true, 'e-mail': true, 'Telegram': false } },
    { id: 'mentor_sale', label: t('types.mentor_sale'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { 'WEB': true, 'e-mail': true, 'Telegram': false } },
    { id: 'api_expired', label: t('types.api_expired'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { 'WEB': true, 'e-mail': true, 'Telegram': false } },
    { id: 'loss_received', label: t('types.loss_received'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
    { id: 'sim_completed', label: t('types.sim_completed'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { 'WEB': true, 'e-mail': true, 'Telegram': true } },
    { id: 'first_order', label: t('types.first_order'), options: ['WEB', 'e-mail', 'Telegram'], defaults: { Telegram: false } },
  ];

  return (
    <div className="space-y-12">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <div className="rounded-xl border bg-card/30 p-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {notificationTypes.map(type => (
            <div key={type.id} className="space-y-4">
              <h4 className="text-sm font-medium leading-tight">{type.label}</h4>
              <div className="flex flex-wrap gap-2">
                {type.options.map((option) => {
                  const isActive = type.defaults?.[option as keyof typeof type.defaults];
                  return (
                    <div key={option} className="flex items-center gap-1.5 rounded-md border bg-muted/20 px-2 py-1">
                      {isActive && <CheckIcon className="size-3 text-blue-500" />}
                      <span className={cn('text-[10px] font-medium uppercase', isActive ? 'text-blue-500' : 'text-muted-foreground opacity-50')}>
                        {option}
                      </span>
                      <div className="ml-1 flex items-center gap-1">
                        <span className="w-4 text-[8px] font-bold text-muted-foreground">{isActive ? 'on' : 'off'}</span>
                        <Switch className="h-3 w-6" checked={isActive} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-8 border-t pt-12">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t('report.title')}</h4>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex gap-2">
                {['WEB', 'e-mail', 'Telegram'].map(opt => (
                  <div key={opt} className="flex items-center gap-1.5 rounded-md border bg-muted/20 px-2 py-1">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground opacity-50">{opt}</span>
                    <div className="ml-1 flex items-center gap-1">
                      <span className="w-4 text-[8px] font-bold text-muted-foreground">off</span>
                      <Switch className="h-3 w-6" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {[t('report.daily'), t('report.weekly'), t('report.monthly')].map(label => (
                  <div key={label} className="rounded-md border bg-muted/20 px-3 py-1.5 text-[10px] font-medium uppercase text-muted-foreground opacity-30">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                {t('settings.auto_delete')}
                :
              </Label>
              <Select defaultValue="1">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('settings.month')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('settings.month')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                {t('settings.telegram')}
                :
              </Label>
              <div className="flex items-center gap-3 py-2">
                <Switch checked={true} />
                <span className="text-xs font-bold uppercase text-blue-500">YES</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button className="bg-blue-600 px-8 hover:bg-blue-700">
            {commonT('save_changes')}
          </Button>
        </div>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
