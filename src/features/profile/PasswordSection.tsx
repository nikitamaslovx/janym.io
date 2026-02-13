'use client';

import { EyeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const PasswordSection = () => {
  const t = useTranslations('UserProfile.password_tab');
  const commonT = useTranslations('UserProfile');

  return (
    <div className="space-y-12">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <div className="space-y-6 rounded-xl border bg-card/30 p-8">
        <h3 className="text-sm font-medium uppercase text-muted-foreground">{t('2fa.title')}</h3>
        <RadioGroup defaultValue="disabled" className="flex flex-wrap gap-8">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="disabled" id="2fa-disabled" />
            <Label htmlFor="2fa-disabled" className="cursor-pointer text-sm font-normal">{t('2fa.disabled')}</Label>
          </div>
          <div className="flex cursor-not-allowed items-center space-x-2 opacity-50">
            <RadioGroupItem value="sms" id="2fa-sms" disabled />
            <Label htmlFor="2fa-sms" className="text-sm font-normal">{t('2fa.sms')}</Label>
          </div>
          <div className="flex cursor-not-allowed items-center space-x-2 opacity-50">
            <RadioGroupItem value="google" id="2fa-google" disabled />
            <Label htmlFor="2fa-google" className="text-sm font-normal">{t('2fa.google')}</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="rounded-xl border bg-card/30 p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-sm font-normal text-muted-foreground">{t('form.new_password')}</Label>
            <div className="relative">
              <Input
                id="new_password"
                type="password"
                placeholder={t('form.new_password_placeholder')}
                className="pr-10"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <EyeIcon className="size-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-sm font-normal text-muted-foreground">{t('form.confirm_password')}</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type="password"
                placeholder={t('form.confirm_password_placeholder')}
                className="pr-10"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <EyeIcon className="size-4" />
              </button>
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
