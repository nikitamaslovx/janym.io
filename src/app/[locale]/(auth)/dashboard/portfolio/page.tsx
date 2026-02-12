import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { TitleBar } from '@/features/dashboard/TitleBar';
import { PortfolioOverview } from '@/features/portfolio/PortfolioOverview';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations({
    locale: (await props.params).locale,
    namespace: 'PortfolioOverview',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PortfolioPage() {
  const t = useTranslations('PortfolioOverview');

  return (
    <>
      <TitleBar title={t('title')} description={t('description')} />
      <PortfolioOverview />
    </>
  );
}
