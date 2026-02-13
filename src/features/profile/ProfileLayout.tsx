'use client';

import React, { useState } from 'react';

import { AccountSummary } from './AccountSummary';
import { CommissionsSection } from './CommissionsSection';
import { MarketplaceSettingsSection } from './MarketplaceSettingsSection';
import { NotificationsSection } from './NotificationsSection';
import { PasswordSection } from './PasswordSection';
import { ProfileBasicInfo } from './ProfileBasicInfo';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { ProfileSidebar } from './ProfileSidebar';

export const ProfileLayout = () => {
  const [activeSection, setActiveSection] = useState('account_info');

  return (
    <div className="flex w-full flex-col gap-8 md:flex-row">
      <ProfileSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 space-y-12 pb-20">
        {activeSection === 'account_info' && (
          <>
            <AccountSummary />
            <ProfileBasicInfo />
            <ProfileSettingsForm />
          </>
        )}
        {activeSection === 'commissions' && (
          <CommissionsSection />
        )}
        {activeSection === 'marketplace_settings' && (
          <MarketplaceSettingsSection />
        )}
        {activeSection === 'notifications' && (
          <NotificationsSection />
        )}
        {activeSection === 'password' && (
          <PasswordSection />
        )}
        {!['account_info', 'commissions', 'marketplace_settings', 'balance_history', 'referral_program', 'payout_request', 'external_accounts', 'notifications', 'password'].includes(activeSection) && (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Раздел "
            {activeSection}
            " в разработке...
          </div>
        )}
      </div>
    </div>
  );
};
