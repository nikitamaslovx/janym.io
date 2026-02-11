import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { StrategyList } from '@/features/dashboard/strategies/StrategyList';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'StrategyDashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function StrategyDashboardPage() {
  const t = useTranslations('StrategyDashboard');

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('header_title')}</h1>
        <p className="text-lg text-muted-foreground">{t('header_description')}</p>
      </div>
      <StrategyList />
    </>
  );
}
