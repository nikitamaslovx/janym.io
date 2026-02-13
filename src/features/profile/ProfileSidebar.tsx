'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import { cn } from '@/utils/cn';

type ProfileSidebarProps = {
  activeSection: string;
  onSectionChange: (section: string) => void;
};

export const ProfileSidebar = ({ activeSection, onSectionChange }: ProfileSidebarProps) => {
  const t = useTranslations('UserProfile.nav');

  const navItems = [
    { id: 'account_info', label: t('account_info') },
    { id: 'commissions', label: t('commissions') },
    { id: 'marketplace_settings', label: t('marketplace_settings') },
    { id: 'balance_history', label: t('balance_history') },
    { id: 'referral_program', label: t('referral_program') },
    { id: 'payout_request', label: t('payout_request') },
    { id: 'external_accounts', label: t('external_accounts') },
    { id: 'notifications', label: t('notifications') },
    { id: 'password', label: t('password') },
  ];

  return (
    <nav className="flex w-64 flex-col gap-1 pr-8">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => onSectionChange(item.id)}
          className={cn(
            'flex items-center rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors',
            activeSection === item.id
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};
