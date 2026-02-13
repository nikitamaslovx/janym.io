import { useTranslations } from 'next-intl';

import { TitleBar } from '@/features/dashboard/TitleBar';
import { ProfileLayout } from '@/features/profile/ProfileLayout';

const UserProfilePage = () => {
  const t = useTranslations('UserProfile');

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <ProfileLayout />
    </>
  );
};

export default UserProfilePage;
