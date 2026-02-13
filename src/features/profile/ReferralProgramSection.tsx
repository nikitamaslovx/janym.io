'use client';

import { ChevronDown, Maximize2, RefreshCw, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const ReferralProgramSection = () => {
  const t = useTranslations('UserProfile.referral');
  const tableT = useTranslations('UserProfile.balance_history.table');

  const stats = [
    { title: t('stats.your_commissions'), value: '30%', sub: '', color: 'text-blue-500' },
    { title: t('stats.attracted_users'), value: '0', sub: '', color: '' },
    { title: t('stats.total_income'), value: '0', sub: '₿', color: 'text-orange-500' },
    { title: t('stats.total_paid'), value: '0', sub: '₿', color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-12">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item, index) => (
          <Card key={index} className="bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-baseline gap-1">
                <span className={cn('text-3xl font-bold', item.color)}>{item.value}</span>
                {item.sub && <span className="text-xl text-muted-foreground">{item.sub}</span>}
              </div>
              <p className="mt-2 text-xs leading-tight text-muted-foreground">
                {item.title}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="border-blue-600/30 bg-blue-600/10">
          <CardContent className="p-6">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-blue-500">0.00000000</span>
              <span className="text-lg text-blue-500">₿</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-tight text-blue-500">
              {t('stats.available')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="size-4" />
              {tableT('refresh')}
              <ChevronDown className="size-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="size-4" />
              {tableT('column_settings')}
            </Button>
          </div>

          <div className="flex max-w-sm flex-1 items-center gap-2">
            <Input placeholder={tableT('search_placeholder')} className="h-9" />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-9">
              <Maximize2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card/30">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/20 font-medium uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t('table.ref_id')}</th>
                <th className="px-4 py-3">{t('table.reg_date')}</th>
                <th className="px-4 py-3">{t('table.referrer')}</th>
                <th className="px-4 py-3">{t('table.add_info')}</th>
                <th className="px-4 py-3">{t('table.commission')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="rounded-full bg-muted/50 p-4">
                      <Settings className="size-8 opacity-20" />
                    </div>
                    <span>{tableT('no_data')}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{tableT('rows_per_page')}</span>
          <Select defaultValue="10">
            <SelectTrigger className="h-8 w-16">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t('links.title')}</h3>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">
              {t('links.type_label')}
              :
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t('links.select_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {/* Options would go here */}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t('banners.title')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                {t('banners.size_label')}
                :
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('links.select_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {/* Options would go here */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                {t('banners.available_label')}
                :
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('links.select_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {/* Options would go here */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
