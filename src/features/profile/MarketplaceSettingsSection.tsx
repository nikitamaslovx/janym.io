'use client';

import { AlertCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const MarketplaceSettingsSection = () => {
  const t = useTranslations('UserProfile.marketplace_settings');
  const commonT = useTranslations('UserProfile');

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <div className="space-y-8 rounded-xl border bg-card/30 p-8">
        <h3 className="text-lg font-medium">{t('mentorship')}</h3>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <Label htmlFor="mentor_toggle" className="text-muted-foreground">{t('i_want_to_be_mentor')}</Label>
            <div className="flex items-center gap-3">
              <Switch id="mentor_toggle" />
              <span className="text-[10px] font-bold text-muted-foreground">NO</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="mentor_price" className="text-muted-foreground">{t('price')}</Label>
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-500">0.</span>
              <Input id="mentor_price" placeholder="0" className="w-full" />
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="mentor_contact" className="text-muted-foreground">{t('contact')}</Label>
            <Input id="mentor_contact" />
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50/10 p-4 text-sm text-orange-600 dark:border-orange-900/30 dark:bg-orange-900/10">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          <p>{t('description_hint')}</p>
        </div>

        <div className="min-h-[200px] rounded-lg border bg-background p-4">
          <div className="mb-4 flex gap-4 border-b pb-2">
            {/* Simple Mock Rich Text Editor Toolbar */}
            <span className="text-xs font-medium text-muted-foreground">Normal</span>
            <div className="flex gap-2">
              <span className="font-bold">B</span>
              <span className="italic">I</span>
              <span className="underline">U</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="default" className="bg-blue-600 px-8 hover:bg-blue-700">
            {commonT('save_changes')}
          </Button>
        </div>
      </div>
    </div>
  );
};
