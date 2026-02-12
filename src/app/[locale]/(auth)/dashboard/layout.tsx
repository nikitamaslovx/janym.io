import { getTranslations } from 'next-intl/server';

import { DashboardShell } from '@/features/dashboard/layout/DashboardShell';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    description: t('meta_description'),
    title: t('meta_title'),
  };
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {props.children}
    </DashboardShell>
  );
}

export const dynamic = 'force-dynamic';
