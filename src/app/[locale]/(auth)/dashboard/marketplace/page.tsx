'use client';

import { useTranslations } from 'next-intl';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BotMarketplace from '@/features/dashboard/components/BotMarketplace';

export default function MarketplacePage() {
  const t = useTranslations('Marketplace');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Tabs defaultValue="buy" className="w-full">
        <TabsList>
          <TabsTrigger value="buy">{t('tabs.buy')}</TabsTrigger>
          <TabsTrigger value="sell">{t('tabs.sell')}</TabsTrigger>
          <TabsTrigger value="mentorship">{t('tabs.mentorship')}</TabsTrigger>
        </TabsList>
        <TabsContent value="buy" className="mt-6">
          <BotMarketplace />
        </TabsContent>
        <TabsContent value="sell" className="mt-6">
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">{t('sell_placeholder')}</p>
          </div>
        </TabsContent>
        <TabsContent value="mentorship" className="mt-6">
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-muted-foreground">{t('mentorship_placeholder')}</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
