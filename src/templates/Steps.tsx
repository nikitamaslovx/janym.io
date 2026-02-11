import { useTranslations } from 'next-intl';

import { FeatureCard } from '@/features/landing/FeatureCard';
import { Section } from '@/features/landing/Section';

export const Steps = () => {
  const t = useTranslations('Steps');

  return (
    <Section
      title={t('section_title')}
      description={t('section_description')}
    >
      <div className="grid grid-cols-1 gap-x-3 gap-y-8 md:grid-cols-3">
        <FeatureCard
          icon={(
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              1
            </div>
          )}
          title={t('step1_title')}
        >
          {t('step1_description')}
        </FeatureCard>

        <FeatureCard
          icon={(
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              2
            </div>
          )}
          title={t('step2_title')}
        >
          {t('step2_description')}
        </FeatureCard>

        <FeatureCard
          icon={(
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              3
            </div>
          )}
          title={t('step3_title')}
        >
          {t('step3_description')}
        </FeatureCard>
      </div>
    </Section>
  );
};
