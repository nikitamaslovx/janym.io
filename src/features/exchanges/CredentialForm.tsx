'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

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
import type { Exchange } from '@/types/exchange';

const exchanges: Exchange[] = [
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

const credentialFormSchema = z.object({
  exchange: z.string().min(1, 'Exchange is required'),
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
  passphrase: z.string().optional(),
  isTestnet: z.boolean().default(false),
});

type CredentialFormValues = z.infer<typeof credentialFormSchema>;

interface CredentialFormProps {
  exchange?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CredentialForm = ({ exchange, onSuccess, onCancel }: CredentialFormProps) => {
  const t = useTranslations('CredentialForm');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: {
      exchange: exchange || '',
      apiKey: '',
      apiSecret: '',
      passphrase: '',
      isTestnet: false,
    },
  });

  const onSubmit = async (data: CredentialFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/exchanges/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save credentials');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      alert(error instanceof Error ? error.message : 'Failed to save credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="exchange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('exchange_label')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!exchange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('exchange_placeholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {exchanges.map((ex) => (
                    <SelectItem key={ex} value={ex}>
                      {ex.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('api_key_label')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t('api_key_placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('api_key_description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="apiSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('api_secret_label')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t('api_secret_placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('api_secret_description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passphrase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('passphrase_label')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t('passphrase_placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('passphrase_description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('save_button')}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {t('cancel_button')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
