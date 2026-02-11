import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { TitleBar } from '@/features/dashboard/TitleBar';
import { CredentialsManager } from '@/features/exchanges/CredentialsManager';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'CredentialsManager',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const ExchangesPage = () => {
  const t = useTranslations('CredentialsManager');

  return (
    <>
      <TitleBar
        title={t('title')}
        description={t('description')}
      />

      <div className="mt-8">
        <CredentialsManager />
      </div>
    </>
  );
};

export default ExchangesPage;
