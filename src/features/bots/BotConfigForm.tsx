'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { StrategyType } from '@/types/bot';
import type { Exchange as ExchangeType } from '@/types/exchange';

const strategyTypes: StrategyType[] = [
  'pure_market_making',
  'cross_exchange_mining',
  'arbitrage',
  'avellaneda_market_making',
  'perpetual_market_making',
  'spot_perpetual_arbitrage',
  'liquidity_mining',
  'v2',
  'custom',
];

const exchanges: ExchangeType[] = [
  'binance',
  'binance_perpetual',
  'coinbase_pro',
  'kraken',
  'kucoin',
  'gate_io',
  'huobi',
  'bitfinex',
  'okx',
  'bybit',
  'dydx',
  'pancakeswap',
  'uniswap',
  'sushiswap',
  'balancer',
  'curve',
];

const botFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  strategyType: z.enum([
    'pure_market_making',
    'cross_exchange_mining',
    'arbitrage',
    'avellaneda_market_making',
    'perpetual_market_making',
    'spot_perpetual_arbitrage',
    'liquidity_mining',
    'v2',
    'custom',
  ]),
  exchange: z.string().min(1, 'Exchange is required'),
  tradingPair: z.string().min(1, 'Trading pair is required'),
  config: z.unknown().default({}),
});

type BotFormValues = z.infer<typeof botFormSchema>;

type BotConfigFormProps = {
  botId?: string;
  initialData?: Partial<BotFormValues>;
  onSuccess?: () => void;
};

export const BotConfigForm = ({ botId, initialData, onSuccess }: BotConfigFormProps) => {
  const t = useTranslations('BotConfigForm');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<BotFormValues>({
    resolver: zodResolver(botFormSchema),
    defaultValues: initialData || {
      name: '',
      strategyType: 'pure_market_making',
      exchange: '',
      tradingPair: '',
      config: {},
    },
  });

  const strategyType = form.watch('strategyType');

  // Handle local state for YAML config as string
  const [yamlConfig, setYamlConfig] = React.useState(
    strategyType === 'v2' && initialData?.config
      ? JSON.stringify(initialData.config, null, 2)
      : '',
  );

  const onSubmit = async (data: BotFormValues) => {
    setIsSubmitting(true);
    try {
      let finalConfig = data.config;

      // For V2, parse the YAML/JSON string from the textarea
      if (data.strategyType === 'v2' && yamlConfig) {
        try {
          // We use JSON.parse for now as a simple way to handle the textarea
          // In a real app we might use a proper YAML parser
          finalConfig = JSON.parse(yamlConfig);
        } catch {
          throw new Error('Invalid JSON configuration for V2 controllers');
        }
      }

      const url = botId ? `/api/bots/${botId}` : '/api/bots';
      const method = botId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          config: finalConfig,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save bot');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/strategies');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving bot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name_label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('name_placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('name_description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="strategyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('strategy_type_label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('strategy_type_placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {strategyTypes.map(strategy => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t('strategy_type_description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exchange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('exchange_label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('exchange_placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exchanges.map(exchange => (
                    <SelectItem key={exchange} value={exchange}>
                      {exchange.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t('exchange_description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tradingPair"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('trading_pair_label')}</FormLabel>
              <FormControl>
                <Input placeholder="BTC-USDT" {...field} />
              </FormControl>
              <FormDescription>{t('trading_pair_description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {strategyType === 'v2' && (
          <div className="space-y-4 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
            <FormLabel>{t('v2_config_label')}</FormLabel>
            <textarea
              className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={yamlConfig}
              onChange={e => setYamlConfig(e.target.value)}
              placeholder='{ "controllers": [ { "controller_type": "market_making", ... } ] }'
            />
            <p className="text-[0.8rem] text-muted-foreground">
              {t('v2_config_description')}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : botId ? t('update_button') : t('create_button')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t('cancel_button')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
