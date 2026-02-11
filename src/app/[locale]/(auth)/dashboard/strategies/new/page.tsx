import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { BotConfigForm } from '@/features/bots/BotConfigForm';
import { TitleBar } from '@/features/dashboard/TitleBar';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'BotConfigForm',
  });

  return {
    title: t('create_button'),
    description: 'Create a new trading bot',
  };
}

export default function NewBotPage() {
  const t = useTranslations('BotConfigForm');

  return (
    <>
      <TitleBar title={t('create_button')} description="Create a new trading bot" />
      <div className="max-w-2xl">
        <BotConfigForm />
      </div>
    </>
  );
}
