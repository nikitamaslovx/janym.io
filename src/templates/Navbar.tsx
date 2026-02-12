import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { buttonVariants } from '@/components/ui/buttonVariants';
import { CenteredMenu } from '@/features/landing/CenteredMenu';
import { Section } from '@/features/landing/Section';
import { getI18nPath } from '@/utils/Helpers';

import { Logo } from './Logo';

export const Navbar = () => {
  const t = useTranslations('Navbar');
  const locale = useLocale();

  return (
    <Section className="px-3 py-6">
      <CenteredMenu
        logo={<Logo />}
        rightMenu={(
          <>
            {/* <li data-fade>
              <ThemeToggle />
            </li> */}
            <li data-fade>
              <LocaleSwitcher />
            </li>
            <SignedOut>
              <li className="ml-1 mr-2.5" data-fade>
                <Link href={getI18nPath('/sign-in', locale)}>{t('sign_in')}</Link>
              </li>
              <li>
                <Link className={buttonVariants()} href={getI18nPath('/sign-up', locale)}>
                  {t('sign_up')}
                </Link>
              </li>
            </SignedOut>

            <SignedIn>
              <li className="ml-1 mr-2.5" data-fade>
                <Link href={getI18nPath('/dashboard', locale)}>{t('dashboard')}</Link>
              </li>
              <li>
                <UserButton />
              </li>
            </SignedIn>
          </>
        )}
      >
        <li>
          <Link href="/sign-up">{t('product')}</Link>
        </li>

        <li>
          <Link href="/sign-up">{t('docs')}</Link>
        </li>

        <li>
          <Link href="/sign-up">{t('blog')}</Link>
        </li>

        <li>
          <Link href="/sign-up">{t('community')}</Link>
        </li>

        <li>
          <Link href="/sign-up">{t('company')}</Link>
        </li>
      </CenteredMenu>
    </Section>
  );
};
