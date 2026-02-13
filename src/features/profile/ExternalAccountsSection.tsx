'use client';

import { ChevronDown, Maximize2, RefreshCw, Settings, Trash2 } from 'lucide-react';
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

export const ExternalAccountsSection = () => {
  const t = useTranslations('UserProfile.external_accounts');
  const tableT = useTranslations('UserProfile.balance_history.table');

  return (
    <div className="space-y-12">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <div className="space-y-6 rounded-xl border bg-card/30 p-8">
        <h3 className="font-semibold">{t('connect_title')}</h3>
        <div className="flex max-w-md flex-wrap items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label className="text-xs uppercase text-muted-foreground">{t('provider')}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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

        <div className="overflow-hidden rounded-xl border bg-card/30">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-muted/20 font-medium uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t('table.id')}</th>
                <th className="px-4 py-3">{t('table.provider')}</th>
                <th className="px-4 py-3">{t('table.email')}</th>
                <th className="px-4 py-3">{t('table.connected')}</th>
                <th className="px-4 py-3 text-right">{t('table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4 text-muted-foreground">#731</td>
                <td className="p-4 text-muted-foreground">Google</td>
                <td className="p-4 text-muted-foreground">nikita.maslovx@gmail.com</td>
                <td className="p-4 text-muted-foreground">
                  <div className="font-semibold">17.01.2022,</div>
                  <div className="text-[10px]">14:00:21</div>
                </td>
                <td className="p-4 text-right">
                  <Button variant="outline" size="icon" className="size-8 text-blue-500">
                    <Trash2 className="size-4" />
                  </Button>
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
    </div>
  );
};
