import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { BotDashboard } from '@/features/bots/BotDashboard';
import { TitleBar } from '@/features/dashboard/TitleBar';

export async function generateMetadata(props: { params: Promise<{ locale: string; id: string }> }) {
  const t = await getTranslations({
    locale: (await props.params).locale,
    namespace: 'BotDashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function BotDashboardPage() {
  const t = useTranslations('BotDashboard');

  return (
    <>
      <TitleBar title={t('title')} description={t('description')} />
      <BotDashboard />
    </>
  );
}
