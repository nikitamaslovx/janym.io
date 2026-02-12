'use client';

import { BookOpen, Bot, LayoutDashboard, LineChart, Menu, ShoppingCart, User, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export const DashboardSidebar = () => {
  const t = useTranslations('DashboardLayout');
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: t('home'),
    },
    {
      href: '/dashboard/bots', // We will reuse strategies page or create new
      icon: Bot,
      label: t('bots'),
    },
    {
      href: '/dashboard/marketplace',
      icon: ShoppingCart,
      label: t('marketplace'),
    },
    {
      href: '/dashboard/statistics',
      icon: LineChart,
      label: t('statistics'),
    },
    {
      href: '/dashboard/finance',
      icon: Wallet,
      label: t('finance'),
    },
    {
      href: '/dashboard/referral',
      icon: Users,
      label: t('referral'),
    },
    {
      href: '/docs', // External link or internal docs
      icon: BookOpen,
      label: t('knowledge_base'),
    },
    {
      href: '/dashboard/user-profile',
      icon: User,
      label: t('profile'),
    },
  ];

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-card/50 p-4 backdrop-blur-xl md:hidden">
        <div className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-xl font-bold text-transparent">
          Janym.io
        </div>
        <Button size="icon" variant="ghost" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          <Menu className="size-6" />
        </Button>
      </div>

      <div className={cn(
        'fixed inset-y-0 left-0 top-0 z-40 w-64 transform border-r bg-card/50 backdrop-blur-xl transition-transform duration-200 ease-in-out md:static md:h-screen md:translate-x-0',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b bg-card/50 px-6">
            <Link className="flex items-center gap-2" href="/">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <svg className="text-primary" fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">Janym.io</span>
            </Link>
          </div>

          <div className="flex-1 space-y-1 px-3 py-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href; // Simple check, might need strict check for root
              return (
                <Link
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto size-1 animate-pulse rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="border-t bg-card/30 p-4">
            <div className="mb-2 flex justify-end">
              <ThemeToggle />
            </div>
            <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/10 to-blue-600/10 p-4">
              <h4 className="mb-1 text-sm font-semibold">Pro Plan</h4>
              <p className="mb-3 text-xs text-muted-foreground">Upgrade for more strategies.</p>
              <Button className="w-full bg-primary/90 text-xs shadow-lg shadow-primary/20 hover:bg-primary" size="sm">
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsMobileOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
        />
      )}
    </>
  );
};
