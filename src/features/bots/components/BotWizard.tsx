'use client';

import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BotWizard() {
  const t = useTranslations('BotWizard');
  const [step, setStep] = useState<string>('init');

  const steps = ['init', 'pair', 'budget', 'strategy', 'filters'];
  const currentStepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setStep(nextStep);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setStep(prevStep);
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t(`steps.${step}`)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={step} onValueChange={setStep} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {steps.map(s => (
              <TabsTrigger key={s} value={s} disabled>
                {t(`steps.${s}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 space-y-6">
            <TabsContent value="init" className="space-y-4">
              <div className="grid gap-2">
                <Label>{t('init.nameLabel')}</Label>
                <Input placeholder="My Bot 1" />
              </div>
              <div className="grid gap-2">
                <Label>{t('init.exchangeLabel')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="binance">Binance</SelectItem>
                    <SelectItem value="bybit">Bybit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="pair" className="space-y-4">
              <div className="grid gap-2">
                <Label>{t('pair.pairLabel')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pair" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                    <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('pair.algoLabel')}</Label>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">{t('pair.algoLong')}</Button>
                  <Button variant="outline" className="flex-1">{t('pair.algoShort')}</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
              <div className="grid gap-2">
                <Label>{t('budget.limitLabel')}</Label>
                <div className="flex gap-2">
                  <Input placeholder={t('budget.amountPlaceholder')} className="flex-1" />
                  <Input placeholder={t('budget.percentPlaceholder')} className="w-24" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <div className="grid gap-2">
                <Label>{t('strategy.modeLabel')}</Label>
                <Select defaultValue="template">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template">{t('strategy.template')}</SelectItem>
                    <SelectItem value="manual">{t('strategy.manual')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('strategy.template')}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('strategy.templates.light')}</SelectItem>
                    <SelectItem value="normal">{t('strategy.templates.normal')}</SelectItem>
                    <SelectItem value="extreme">{t('strategy.templates.extreme')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="grid gap-2">
                <Label>{t('filters.startFilters')}</Label>
                <div className="flex items-center space-x-2">
                  <Input type="checkbox" className="size-4" />
                  <span>{t('filters.rsi')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input type="checkbox" className="size-4" />
                  <span>{t('filters.bollinger')}</span>
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStepIndex === 0}>
              {t('buttons.back')}
            </Button>
            {currentStepIndex === steps.length - 1
              ? (
                  <Button>{t('buttons.create')}</Button>
                )
              : (
                  <Button onClick={handleNext}>{t('buttons.next')}</Button>
                )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
