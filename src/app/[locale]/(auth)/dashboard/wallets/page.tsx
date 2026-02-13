import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { TitleBar } from '@/features/dashboard/TitleBar';
import { WalletsManager } from '@/features/wallets/WalletsManager';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Wallets',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const WalletsPage = () => {
  const t = useTranslations('Wallets');

  return (
    <>
      <TitleBar
        title={t('title')}
        description={t('description')}
      />

      <div className="mt-8">
        <WalletsManager />
      </div>
    </>
  );
};

export default WalletsPage;
