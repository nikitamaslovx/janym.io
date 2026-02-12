import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import BotWizard from '@/features/bots/components/BotWizard';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'BotWizard',
  });

  return {
    title: t('steps.init'), // Or a better title
  };
}

export default function NewBotPage() {
  const t = useTranslations('BotWizard');

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t('steps.init')}</h1>
        {' '}
        {/* We can change this title */}
      </div>
      <BotWizard />
    </div>
  );
}
