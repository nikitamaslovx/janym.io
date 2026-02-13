'use client';

import { CalendarIcon, ChevronDown, Download, FileSpreadsheet, Maximize2, RefreshCw, Settings } from 'lucide-react';
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

export const BalanceHistorySection = () => {
  const t = useTranslations('UserProfile.balance_history');

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <Card className="bg-card/30">
        <CardContent className="space-y-6 p-8">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t('filters.title')}</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">
                {t('filters.period')}
                :
              </Label>
              <div className="flex h-10 w-48 items-center justify-between rounded-md border bg-background px-3">
                <span className="text-sm">{t('filters.today')}</span>
                <CalendarIcon className="size-4 text-muted-foreground" />
              </div>
            </div>
            <Button variant="outline" className="h-10 border-dashed">
              +
              {' '}
              {t('filters.add_filters')}
            </Button>
            <Button className="h-10 bg-blue-600 hover:bg-blue-700">
              {t('filters.apply')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="size-4" />
              {t('table.refresh')}
              <ChevronDown className="size-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="size-4" />
              {t('table.column_settings')}
            </Button>
          </div>

          <div className="flex max-w-sm flex-1 items-center gap-2">
            <Input placeholder={t('table.search_placeholder')} className="h-9" />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-9">
              <FileSpreadsheet className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-9">
              <Download className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-9">
              <Maximize2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card/30">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/20 font-medium uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t('table.type')}</th>
                <th className="px-4 py-3">{t('table.status')}</th>
                <th className="px-4 py-3">{t('table.bot')}</th>
                <th className="px-4 py-3">{t('table.info')}</th>
                <th className="px-4 py-3">{t('table.exchange')}</th>
                <th className="px-4 py-3">{t('table.deal')}</th>
                <th className="px-4 py-3">{t('table.income')}</th>
                <th className="px-4 py-3">{t('table.amount')}</th>
                <th className="px-4 py-3">{t('table.created')}</th>
                <th className="px-4 py-3">{t('table.executed')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={10} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <div className="rounded-full bg-muted/50 p-4">
                      <Settings className="size-8 opacity-20" />
                    </div>
                    <span>{t('table.no_data')}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t('table.rows_per_page')}</span>
          <Select defaultValue="10">
            <SelectTrigger className="h-8 w-16">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
