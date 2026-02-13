'use client';

import {
  ChevronRight,
  Maximize2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type WalletData = {
  id: string;
  name: string;
  created: string;
  updated: string;
  exchange: string;
  currencyIcon: string;
  currencyName: string;
  type: string;
  amount: string;
  amountColor?: string;
};

export const WalletsManager = () => {
  const t = useTranslations('Wallets');
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data based on screenshot
    const mockData: WalletData[] = [
      {
        id: '1',
        name: 'maslovx',
        created: '2022-01-17 10:11:09',
        updated: '2023-09-03 18:02:04',
        exchange: 'BINANCE',
        currencyIcon: 'T',
        currencyName: 'USDT',
        type: t('table.type_fixed'),
        amount: '2000',
        amountColor: 'text-green-500',
      },
      {
        id: '2',
        name: 'maslovx Futures2',
        created: '2022-01-29 05:59:16',
        updated: '2023-09-06 06:38:31',
        exchange: 'BINANCE-FUTURES USDT-margin',
        currencyIcon: 'T',
        currencyName: 'USDT',
        type: t('table.type_fixed'),
        amount: '100.10944122',
        amountColor: 'text-green-500',
      },
      {
        id: '3',
        name: 'maslovx futures',
        created: '2023-09-03 18:00:34',
        updated: '2023-09-05 21:53:39',
        exchange: 'BINANCE-FUTURES USDT-margin',
        currencyIcon: 'T',
        currencyName: 'USDT',
        type: t('table.type_fixed'),
        amount: '100',
        amountColor: 'text-green-500',
      },
      {
        id: '4',
        name: 'maslovx futures ник рек',
        created: '2023-09-04 23:21:39',
        updated: '2023-09-05 21:54:14',
        exchange: 'BINANCE-FUTURES USDT-margin',
        currencyIcon: 'T',
        currencyName: 'USDT',
        type: t('table.type_fixed'),
        amount: '100',
        amountColor: 'text-green-500',
      },
    ];
    setWallets(mockData);
    setIsLoading(false);
  }, [t]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Create Wallet Section */}
      <div className="flex aspect-[21/3] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/30">
        <div className="flex size-12 items-center justify-center rounded-lg border bg-background">
          <Wallet className="size-6 text-muted-foreground" />
        </div>
        <Button
          type="button"
          className="h-10 bg-blue-600 px-6 hover:bg-blue-700"
        >
          {t('add_button')}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t('available_title')}</h2>

        {/* Filters Section */}
        <div className="space-y-6 rounded-xl border bg-card/30 p-6">
          <h3 className="text-sm font-medium">{t('filters.title')}</h3>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="button" variant="outline" className="h-8 gap-2 border-dashed text-xs">
              <Plus className="size-3" />
              {t('filters.add')}
            </Button>

            <Button type="button" className="h-8 bg-blue-600 px-6 text-xs hover:bg-blue-700">
              {t('filters.apply')}
            </Button>
          </div>
        </div>

        {/* Table Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex cursor-pointer items-center rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
              <RefreshCw className="mr-2 size-3.5" />
              {t('table.refresh')}
              <ChevronRight className="ml-2 size-3.5" />
            </div>
            <div className="flex cursor-pointer items-center rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
              <Settings className="mr-2 size-3.5" />
              {t('table.settings')}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('table.search_placeholder')}
                className="h-9 bg-background pl-10 text-xs"
              />
            </div>
            <div className="flex size-9 cursor-pointer items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent">
              <Maximize2 className="size-4" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-card/30">
          <Table>
            <TableHeader className="bg-card/50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">{t('table.columns.name')}</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">{t('table.columns.created')}</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">{t('table.columns.updated')}</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">{t('table.columns.exchange')}</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">{t('table.columns.currency')}</TableHead>
                <TableHead className="text-xs font-semibold uppercase text-muted-foreground">{t('table.columns.type')}</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">{t('table.columns.amount')}</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">{t('table.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map(wallet => (
                <TableRow key={wallet.id} className="hover:bg-accent/50">
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="text-xs font-medium">{wallet.name}</TableCell>
                  <TableCell className="whitespace-pre-line text-xs text-muted-foreground">{(wallet.created || '').split(' ').join('\n')}</TableCell>
                  <TableCell className="whitespace-pre-line text-xs text-muted-foreground">{(wallet.updated || '').split(' ').join('\n')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-yellow-400 text-[8px] font-bold text-white">B</div>
                      <span className="text-[10px] font-bold uppercase leading-tight text-gray-700">
                        {(wallet.exchange || '').split(' ').map((word, i) => (
                          <div key={`${wallet.id}-ex-${i}`}>{word}</div>
                        ))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex size-6 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                        {wallet.currencyIcon}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{wallet.currencyName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{wallet.type}</TableCell>
                  <TableCell className={`text-right font-mono text-xs ${wallet.amountColor}`}>
                    {wallet.amount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3 text-blue-500">
                      <Pencil className="size-4 cursor-pointer" />
                      <Trash2 className="size-4 cursor-pointer text-red-500" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Bulk Actions and Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <Button type="button" variant="outline" className="h-10 border-none bg-blue-200 px-6 text-blue-700 hover:bg-blue-300">
            {t('table.bulk_delete')}
          </Button>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{t('table.rows_per_page')}</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-16 bg-background text-xs">
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
      </div>
    </div>
  );
};
