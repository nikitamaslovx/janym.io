import { useTranslations } from 'next-intl';

import { LogoCloud } from '@/features/landing/LogoCloud';

export const SponsorLogos = () => {
  const t = useTranslations('Sponsors');

  return (
    <LogoCloud text={t('title')}>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xl font-bold text-muted-foreground opacity-50">
        <span>Binance</span>
        <span>Bitfinex</span>
        <span>Bitget</span>
        <span>HTX</span>
        <span>Bybit</span>
        <span>Gate.io</span>
        <span>Kraken</span>
        <span>Kucoin</span>
        <span>OKX</span>
        <span>HitBTC</span>
      </div>
    </LogoCloud>
  );
};
