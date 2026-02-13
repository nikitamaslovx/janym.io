'use client';

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

export const ProfileBasicInfo = () => {
  const t = useTranslations('UserProfile.basic_info');

  return (
    <div className="space-y-8 border-t pt-8">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase text-muted-foreground">
            {t('email')}
            :
          </Label>
          <div className="flex h-10 items-center font-medium">nikita.maslovx@gmail.com</div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-xs uppercase text-muted-foreground">
            {t('full_name')}
            :
          </Label>
          <Input id="full_name" defaultValue="Nikita Maslov" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company" className="text-xs uppercase text-muted-foreground">
            {t('company')}
            :
          </Label>
          <Input id="company" placeholder={t('company_placeholder')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-xs uppercase text-muted-foreground">
            {t('timezone')}
            :
          </Label>
          <Select defaultValue="GMT+1">
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Africa/Tunis GMT+1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GMT+1">Africa/Tunis GMT+1</SelectItem>
              <SelectItem value="GMT+3">Europe/Moscow GMT+3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs uppercase text-muted-foreground">
            {t('phone')}
            :
          </Label>
          <div className="flex h-10">
            <span className="flex items-center rounded-l-md border border-r-0 px-3 text-muted-foreground">+</span>
            <Input id="phone" className="rounded-l-none" placeholder="" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language" className="text-xs uppercase text-muted-foreground">
            {t('language')}
            :
          </Label>
          <Select defaultValue="ru">
            <SelectTrigger id="language">
              <SelectValue placeholder="Русский" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs uppercase text-muted-foreground">
          {t('additional_contacts')}
          :
        </Label>
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex h-32 items-center justify-center p-0">
            <Button variant="ghost" className="text-muted-foreground">
              +
              {' '}
              {t('add_contact')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
